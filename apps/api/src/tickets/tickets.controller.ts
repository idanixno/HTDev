import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { TicketStatus, UserRole } from "@zharfa/database";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";
import { OwnerGuard } from "../commerce/roles.guard";
import {
  CreateTicketDto,
  ReplyTicketDto,
  TransitionTicketDto,
} from "./dto/ticket.dto";
import { TicketsService } from "./tickets.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("tickets")
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req: AuthedRequest, @Body() body: CreateTicketDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    return this.tickets.create(user, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async listMine(
    @Req() req: AuthedRequest,
    @Query("status") status?: string,
  ) {
    const parsed = parseStatus(status);
    return this.tickets.listMine(req.user!.id, parsed);
  }

  /** Static admin paths before :id to avoid param capture. */
  @Get("admin")
  @UseGuards(OwnerGuard)
  async adminList(
    @Query("status") status?: string,
    @Query("q") q?: string,
    @Query("courseSlug") courseSlug?: string,
  ) {
    return this.tickets.adminList({
      status: parseStatus(status),
      q,
      courseSlug,
    });
  }

  @Get("admin/:id")
  @UseGuards(OwnerGuard)
  async adminGet(@Param("id") id: string) {
    return this.tickets.adminGet(id);
  }

  @Post("admin/:id/reply")
  @UseGuards(OwnerGuard)
  async adminReply(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: ReplyTicketDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    return this.tickets.replyAsAdmin(user, id, body);
  }

  @Patch("admin/:id/status")
  @UseGuards(OwnerGuard)
  async adminTransition(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: TransitionTicketDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    return this.tickets.transition(user, id, body.status);
  }

  @Get("attachments/:attachmentId/download")
  @UseGuards(AuthGuard)
  async download(
    @Req() req: AuthedRequest,
    @Param("attachmentId") attachmentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    const file = await this.tickets.downloadAttachment(user, attachmentId);
    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    return new StreamableFile(file.bytes);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthedRequest, @Param("id") id: string) {
    if (req.user!.role === UserRole.OWNER) {
      try {
        return await this.tickets.adminGet(id);
      } catch {
        return this.tickets.getMine(req.user!.id, id);
      }
    }
    return this.tickets.getMine(req.user!.id, id);
  }

  @Post(":id/reply")
  @UseGuards(AuthGuard)
  async reply(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: ReplyTicketDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    if (user.role === UserRole.OWNER) {
      return this.tickets.replyAsAdmin(user, id, body);
    }
    return this.tickets.replyAsStudent(user, id, body);
  }

  @Patch(":id/status")
  @UseGuards(AuthGuard)
  async transition(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() body: TransitionTicketDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    return this.tickets.transition(user, id, body.status);
  }
}

function parseStatus(status?: string): TicketStatus | undefined {
  if (!status) return undefined;
  if (Object.values(TicketStatus).includes(status as TicketStatus)) {
    return status as TicketStatus;
  }
  return undefined;
}
