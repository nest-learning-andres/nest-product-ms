import { Controller, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    // return createProductDto;
    return this.productsService.create(createProductDto);
  }

  // @Get()
  @MessagePattern({ cmd: 'find_all_product' })
  findAll(@Payload() paginationDto: PaginationDto) {
    console.log('Fin all');
    return this.productsService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    // console.log('find_one_product', id);
    return this.productsService.findOne(id);
  }

  // @Patch(':id')
  @MessagePattern({ cmd: 'update_product' })
  update(
    // @Param('id', ParseIntPipe) id: number,
    // @Body() updateProductDto: UpdateProductDto,
    @Payload() updateProductDto: UpdateProductDto,
  ) {
    console.log('Update product');
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  // @Delete(':id')
  @MessagePattern({ cmd: 'delete_product' })
  async remove(@Payload() payload: { id: number }) {
    const { id } = payload;

    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }
    return this.productsService.remove(id);
  }
  @MessagePattern({
    cmd: 'validate_products',
  })
  validateProduct(@Payload() ids: number[]) {
    console.log('entra a validate Products');
    return this.productsService.validateProducts(ids);
  }
}
