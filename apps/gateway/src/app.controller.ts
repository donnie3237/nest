import { Controller , Get} from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // ไม่ต้องมี prefix ที่นี่ เพื่อให้จัดการ Root Path ได้
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
}
