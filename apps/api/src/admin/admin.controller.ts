import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { AuthedRequest } from "../identity/auth.guard";
import { OwnerGuard } from "../commerce/roles.guard";
import { CommerceService } from "../commerce/commerce.service";
import { UpdateGatewaySettingDto } from "../commerce/dto/gateway-settings.dto";
import { AdminService } from "./admin.service";
import { AnalyticsService } from "./analytics.service";
import { AuditService } from "./audit.service";
import {
  AdminCustomersQueryDto,
  AdminListQueryDto,
  AdminOrdersQueryDto,
  AnalyticsQueryDto,
  UpdateHomeCmsDto,
  UpsertArticleDto,
  UpsertCategoryDto,
  UpsertCouponDto,
  UpsertCourseDto,
  UpsertFaqDto,
  UpsertLessonDto,
  UpsertModuleDto,
} from "./dto/admin.dto";

/**
 * OWNER-only admin surface. Every route uses OwnerGuard — no obscurity by path.
 */
@Controller("admin")
@UseGuards(OwnerGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly analytics: AnalyticsService,
    private readonly audit: AuditService,
    private readonly commerce: CommerceService,
  ) {}

  @Get("analytics/dashboard")
  dashboard(@Query() query: AnalyticsQueryDto) {
    return this.analytics.dashboard(query);
  }

  @Get("activity")
  activity(
    @Query() query: AdminListQueryDto & { entityType?: string; action?: string },
  ): Promise<{
    items: Array<{
      id: string;
      actorKind: string;
      action: string;
      entityType: string;
      entityId: string | null;
      summary: string;
      metadata: unknown;
      createdAt: string;
      actor: {
        id: string;
        username: string;
        displayName: string;
        role: string;
      } | null;
    }>;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    return this.audit.list(query);
  }

  // Courses
  @Get("courses")
  courses(@Query() query: AdminListQueryDto) {
    return this.admin.listCourses(query);
  }

  @Get("courses/:id")
  course(@Param("id") id: string) {
    return this.admin.getCourse(id);
  }

  @Post("courses")
  createCourse(@Req() req: AuthedRequest, @Body() body: UpsertCourseDto) {
    return this.admin.upsertCourse(req.user!.id, body);
  }

  @Patch("courses/:id")
  updateCourse(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertCourseDto,
  ) {
    return this.admin.upsertCourse(req.user!.id, body, id);
  }

  @Post("courses/:id/modules")
  createModule(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertModuleDto,
  ) {
    return this.admin.upsertModule(req.user!.id, id, body);
  }

  @Patch("modules/:id")
  updateModule(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertModuleDto,
  ) {
    return this.admin.patchModule(req.user!.id, id, body);
  }

  @Delete("modules/:id")
  deleteModule(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteModule(req.user!.id, id);
  }

  @Post("courses/:id/lessons")
  createLesson(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertLessonDto,
  ) {
    return this.admin.upsertLesson(req.user!.id, id, body);
  }

  @Patch("lessons/:id")
  updateLesson(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertLessonDto,
  ) {
    return this.admin.patchLesson(req.user!.id, id, body);
  }

  @Delete("lessons/:id")
  deleteLesson(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteLesson(req.user!.id, id);
  }

  // Categories
  @Get("categories")
  categories() {
    return this.admin.listCategories();
  }

  @Post("categories")
  createCategory(@Req() req: AuthedRequest, @Body() body: UpsertCategoryDto) {
    return this.admin.upsertCategory(req.user!.id, body);
  }

  @Patch("categories/:id")
  updateCategory(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertCategoryDto,
  ) {
    return this.admin.upsertCategory(req.user!.id, body, id);
  }

  // Orders
  @Get("orders")
  orders(@Query() query: AdminOrdersQueryDto) {
    return this.admin.listOrders(query);
  }

  // Customers
  @Get("customers")
  customers(@Query() query: AdminCustomersQueryDto) {
    return this.admin.listCustomers(query);
  }

  // Coupons
  @Get("coupons")
  coupons() {
    return this.admin.listCoupons();
  }

  @Post("coupons")
  createCoupon(@Req() req: AuthedRequest, @Body() body: UpsertCouponDto) {
    return this.admin.upsertCoupon(req.user!.id, body);
  }

  @Patch("coupons/:id")
  updateCoupon(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertCouponDto,
  ) {
    return this.admin.upsertCoupon(req.user!.id, body, id);
  }

  // Payment gateway settings (reuse commerce service)
  @Get("payments/gateways")
  gateways() {
    return this.commerce.listGatewaySettings();
  }

  @Patch("payments/gateways")
  updateGateway(
    @Req() req: AuthedRequest,
    @Body() body: UpdateGatewaySettingDto,
  ) {
    return this.commerce.updateGatewaySetting(body).then(async (result) => {
      await this.audit.record({
        actorId: req.user!.id,
        action: "payment.gateway.update",
        entityType: "PaymentGatewaySetting",
        entityId: body.provider,
        summary: `به‌روزرسانی درگاه ${body.provider}`,
        metadata: {
          technicalEnabled: body.technicalEnabled,
          checkoutVisible: body.checkoutVisible,
          isDefault: body.isDefault,
          sandboxMode: body.sandboxMode,
        },
      });
      return result;
    });
  }

  // Journal
  @Get("articles")
  articles() {
    return this.admin.listArticles();
  }

  @Get("articles/:id")
  article(@Param("id") id: string) {
    return this.admin.getArticle(id);
  }

  @Post("articles")
  createArticle(@Req() req: AuthedRequest, @Body() body: UpsertArticleDto) {
    return this.admin.upsertArticle(req.user!.id, body);
  }

  @Patch("articles/:id")
  updateArticle(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertArticleDto,
  ) {
    return this.admin.upsertArticle(req.user!.id, body, id);
  }

  // CMS
  @Get("cms/home")
  homeCms() {
    return this.admin.getHomeCms();
  }

  @Patch("cms/home")
  updateHome(@Req() req: AuthedRequest, @Body() body: UpdateHomeCmsDto) {
    return this.admin.updateHomeCms(req.user!.id, body);
  }

  @Get("cms/faq")
  faq() {
    return this.admin.listFaq(true);
  }

  @Post("cms/faq")
  createFaq(@Req() req: AuthedRequest, @Body() body: UpsertFaqDto) {
    return this.admin.upsertFaq(req.user!.id, body);
  }

  @Patch("cms/faq/:id")
  updateFaq(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertFaqDto,
  ) {
    return this.admin.upsertFaq(req.user!.id, body, id);
  }

  @Delete("cms/faq/:id")
  deleteFaq(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteFaq(req.user!.id, id);
  }
}
