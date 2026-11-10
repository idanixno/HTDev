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
  UpdateFooterCmsDto,
  UpdateHomeCmsDto,
  UpdatePathsCmsDto,
  UpsertArticleDto,
  UpsertCategoryDto,
  UpsertCouponDto,
  UpsertCourseDto,
  CreatePathStepDto,
  UpsertFaqDto,
  UpsertCoursePurchaseNoteDto,
  CoursePurchaseNotesQueryDto,
  UpsertLearningPathDto,
  UpsertLessonDto,
  UpsertModuleDto,
  UpdateOrderStatusDto,
  UpdatePathStepDto,
} from "./dto/admin.dto";

/**
 * Owner-only admin surface. Non-owners receive 404, the same as a missing route.
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

  @Get("nav-badges")
  navBadges() {
    return this.analytics.navBadges();
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

  @Delete("courses/:id")
  removeCourse(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteCourse(req.user!.id, id);
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

  @Delete("categories/:id")
  removeCategory(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteCategory(req.user!.id, id);
  }

  // Orders
  @Get("orders")
  orders(@Query() query: AdminOrdersQueryDto) {
    return this.admin.listOrders(query);
  }

  @Get("orders/:id")
  order(@Param("id") id: string) {
    return this.admin.getOrder(id);
  }

  @Patch("orders/:id")
  updateOrder(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(req.user!.id, id, body.status);
  }

  @Post("orders/:id/retry-license")
  retryOrderLicense(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
  ) {
    return this.admin.retryOrderLicense(req.user!.id, id);
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

  @Delete("coupons/:id")
  removeCoupon(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteCoupon(req.user!.id, id);
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

  @Delete("articles/:id")
  removeArticle(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.admin.deleteArticle(req.user!.id, id);
  }

  @Get("paths")
  learningPaths() {
    return this.admin.listLearningPaths();
  }

  @Post("paths")
  createLearningPath(
    @Req() req: AuthedRequest,
    @Body() body: UpsertLearningPathDto,
  ) {
    return this.admin.upsertLearningPath(req.user!.id, body);
  }

  @Get("paths/:pathId")
  learningPath(@Param("pathId") pathId: string) {
    return this.admin.getLearningPath(pathId);
  }

  @Patch("paths/:pathId")
  updateLearningPath(
    @Req() req: AuthedRequest,
    @Param("pathId") pathId: string,
    @Body() body: UpsertLearningPathDto,
  ) {
    return this.admin.upsertLearningPath(req.user!.id, body, pathId);
  }

  @Delete("paths/:pathId")
  removeLearningPath(
    @Req() req: AuthedRequest,
    @Param("pathId") pathId: string,
  ) {
    return this.admin.deleteLearningPath(req.user!.id, pathId);
  }

  @Post("paths/:pathId/steps")
  createLearningPathStep(
    @Req() req: AuthedRequest,
    @Param("pathId") pathId: string,
    @Body() body: CreatePathStepDto,
  ) {
    return this.admin.createLearningPathStep(req.user!.id, pathId, body);
  }

  @Get("paths/:pathId/steps/:stepId")
  learningPathStep(@Param("pathId") pathId: string, @Param("stepId") stepId: string) {
    return this.admin.getLearningPathStep(pathId, stepId);
  }

  @Patch("paths/:pathId/steps/:stepId")
  updateLearningPathStep(
    @Req() req: AuthedRequest,
    @Param("pathId") pathId: string,
    @Param("stepId") stepId: string,
    @Body() body: UpdatePathStepDto,
  ) {
    return this.admin.updateLearningPathStep(req.user!.id, pathId, stepId, body);
  }

  @Delete("paths/:pathId/steps/:stepId")
  removeLearningPathStep(
    @Req() req: AuthedRequest,
    @Param("pathId") pathId: string,
    @Param("stepId") stepId: string,
  ) {
    return this.admin.deleteLearningPathStep(req.user!.id, pathId, stepId);
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

  @Get("cms/paths")
  pathsCms() {
    return this.admin.getPathsCms();
  }

  @Patch("cms/paths")
  updatePaths(@Req() req: AuthedRequest, @Body() body: UpdatePathsCmsDto) {
    return this.admin.updatePathsCms(req.user!.id, body);
  }

  @Get("cms/footer")
  footerCms() {
    return this.admin.getFooterCms();
  }

  @Patch("cms/footer")
  updateFooter(@Req() req: AuthedRequest, @Body() body: UpdateFooterCmsDto) {
    return this.admin.updateFooterCms(req.user!.id, body);
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

  @Get("cms/course-notes")
  coursePurchaseNotes(@Query() query: CoursePurchaseNotesQueryDto) {
    return this.admin.listCoursePurchaseNotes({
      scope: query.scope,
      courseId: query.courseId,
      includeUnpublished: true,
    });
  }

  @Post("cms/course-notes")
  createCoursePurchaseNote(
    @Req() req: AuthedRequest,
    @Body() body: UpsertCoursePurchaseNoteDto,
  ) {
    return this.admin.upsertCoursePurchaseNote(req.user!.id, body);
  }

  @Patch("cms/course-notes/:id")
  updateCoursePurchaseNote(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: UpsertCoursePurchaseNoteDto,
  ) {
    return this.admin.upsertCoursePurchaseNote(req.user!.id, body, id);
  }

  @Delete("cms/course-notes/:id")
  deleteCoursePurchaseNote(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
  ) {
    return this.admin.deleteCoursePurchaseNote(req.user!.id, id);
  }
}
