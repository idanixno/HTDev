import { Controller, Get, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { ListCoursesQueryDto } from "./dto/list-courses.dto";

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

  @Get("courses/:slug")
  getCourse(@Param("slug") slug: string) {
    return this.catalog.getCourseBySlug(slug);
  }

  @Get("paths")
  listPaths() {
    return this.catalog.listPaths();
  }

  @Get("paths/:slug")
  getPath(@Param("slug") slug: string) {
    return this.catalog.getPathBySlug(slug);
  }

  @Get("meta/offer-kinds")
  offerKinds() {
    return { items: this.catalog.offerKinds() };
  }
}
