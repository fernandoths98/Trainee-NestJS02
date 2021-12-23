import { Controller, SerializeOptions, Get, UseGuards, UseInterceptors, ClassSerializerInterceptor, Query, DefaultValuePipe, ParseIntPipe, Param, NotFoundException, Put, Body } from "@nestjs/common";
import { AuthGuardJwt } from "src/auth/auth-guard.jwt";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AttendeeService } from "./attendee.service";
import { EventService } from "./event.service";
import { CreateAttendeeDto } from "./input/create-attendee.dto";

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
export class CurrentUserEventAttendanceController {
  constructor(
    private readonly eventsService: EventService,
    private readonly attendeesService: AttendeeService
  ) { }

  @Get()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1
  ) {
    return await this.eventsService
      .getEventsAttendedByUserIdPaginated(
        user.id, { limit: 6, currentPage: page }
      );
  }

  @Get(':eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User
  ) {
    const attendee = await this.attendeesService
      .findOneByEventIdAndUserId(
        eventId, user.id
      );

    if (!attendee) {
      throw new NotFoundException();
    }

    return attendee;
  }

  @Put('/:eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrUpdate(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateAttendeeDto,
    @CurrentUser() user: User
  ) {
    return this.attendeesService.createOrUpdate(
      input, eventId, user.id
    );
  }
}