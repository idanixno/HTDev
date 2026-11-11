import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  RateLimitBucket,
  RateLimitStubGuard,
} from "../identity/rate-limit.stub";
import { CatalogService } from "./catalog.service";
import { ListCoursesQueryDto } from "./dto/list-courses.dto";
import { JoinWaitlistDto } from "./dto/waitlist.dto";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("categories")
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get("courses")
  listCourses(@Query() query: ListCoursesQueryDto) {
    return this.catalog.listCourses(query);
  }

  @Get("courses/featured")
  featuredCourses() {
    return this.catalog.featuredCourses();
  }

  @Post("courses/:slug/waitlist")
  @UseGuards(RateLimitStubGuard)
  @RateLimitBucket("waitlist")
  joinWaitlist(@Param("slug") slug: string, @Body() dto: JoinWaitlistDto) {
    return this.catalog.joinCourseWaitlist(slug, dto.phone);
  }

  @Get("courses/:slug/related-articles")
  relatedArticles(
    @Param("slug") slug: string,
    @Query("limit") limit?: string,
  ) {
    const parsed = limit ? Number(limit) : 4;
    return this.catalog.listRelatedArticlesForCourse(
      slug,
      Number.isFinite(parsed) ? parsed : 4,
    );
  }

  @Get("courses/:slug/tracks")
  courseTracks(@Param("slug") slug: string) {
    return this.catalog.listTracksForCourse(slug);
  }

  @Get("courses/:slug")
  getCourse(@Param("slug") slug: string) {
    return this.catalog.getCourseBySlug(slug);
  }

  @Get("paths")
  listPaths() {
    return this.catalog.listPaths();
  }

  @Get("paths/:slug/steps/:stepSlug")
  getPathStep(@Param("slug") slug: string, @Param("stepSlug") stepSlug: string) {
    return this.catalog.getPathStep(slug, stepSlug);
  }

  @Get("paths/:slug")
  getPath(@Param("slug") slug: string) {
    return this.catalog.getPathBySlug(slug);
  }

  @Get("meta/offer-kinds")
  offerKinds() {
    return { items: this.catalog.offerKinds() };
  }

  @Get("meta/levels")
  levels() {
    return this.catalog.listLevels();
  }

  @Get("meta/paths-page")
  pathsPage() {
    return this.catalog.getPathsPageCms();
  }

  @Get("meta/home-announcement")
  homeAnnouncement() {
    return this.catalog.getHomeAnnouncement();
  }

  @Get("faq")
  faq() {
    return this.catalog.listPublishedFaq();
  }

  @Get("footer-trusts")
  footerTrusts() {
    return this.catalog.getFooterTrusts();
  }

  @Get("articles")
  articles() {
    return this.catalog.listArticles();
  }

  @Get("articles/:slug")
  article(@Param("slug") slug: string) {
    return this.catalog.getArticleBySlug(slug);
  }
}
