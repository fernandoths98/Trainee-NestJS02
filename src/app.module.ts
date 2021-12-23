import { AuthModule } from './auth/auth.module';
import { AppDummy } from './app.dummy';
import { AppJapanService } from './app.japan.service';
import { Event } from './entities/event.entity';
import { EventModule } from './event/event.module';
import { EventController } from './event/event.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';
import { SchoolModule } from './school/school.module';

@Module({
  imports: [EventModule, SchoolModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: process.env.NODE_ENV !== 'production'
      ? ormConfig: ormConfigProd
    }),
  ],
  controllers: [AppController],
  providers: [{
    provide: AppService,
    useClass: AppJapanService
  }, {
    provide: 'APP_NAME',
    useValue: 'Nest Events Backend!'
  }, {
    provide: 'MESSAGE',
      inject: [AppDummy],
      useFactory: (app) => `${app.dummy()} Factory`
  }, AppDummy, 
],
})
export class AppModule {}
