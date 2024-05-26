import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<string>('port');

  const config = new DocumentBuilder()
    .setTitle('Wetelo final task api')
    .setDescription('The user auth and product CRUD logic with jwt and roles')
    .setVersion('1.0')
    .addTag('spi')
    .build();

  const descriptorDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, descriptorDocument);

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
