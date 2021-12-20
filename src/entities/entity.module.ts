import { EventController } from './../event/event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";


@Module({
    imports: [
    ],
    controllers: [EventController],
    providers: [],
    exports: []
})

export class EntityModule {

}