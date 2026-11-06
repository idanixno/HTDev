import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @Req() req: AuthedRequest,
    @Query("unreadOnly") unreadOnly?: string,
    @Query("take") take?: string,
  ): Promise<{
    items: Array<{
      id: string;
      eventType: string;
      title: string;
      body: string;
      payload: unknown;
      readAt: Date | null;
      createdAt: Date;
      deliveries: Array<{
        id: string;
        channel: string;
        status: string;
        templateKey: string;
        sentAt: Date | null;
        error: string | null;
      }>;
    }>;
    unreadCount: number;
  }> {
    return this.notifications.listForUser(req.user!.id, {
      unreadOnly: unreadOnly === "1" || unreadOnly === "true",
      take: take ? Number(take) : undefined,
    });
  }

  @Post("read-all")
  @UseGuards(AuthGuard)
  async markAll(@Req() req: AuthedRequest) {
    return this.notifications.markAllRead(req.user!.id);
  }

  @Post(":id/read")
  @UseGuards(AuthGuard)
  async markRead(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.notifications.markRead(req.user!.id, id);
  }
}
