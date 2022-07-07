import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const port = process.env.PORT || 4002;
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  const server = app.getHttpServer();
  const router = server._events.request._router;

  const availableRoutes: [] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method;
        return `${method.toUpperCase()} ${path}`;
      }
    })
    .filter((item) => item !== undefined);
  console.table(availableRoutes);
  console.info(`PORT: ${port} 🌶`);
}

bootstrap();
