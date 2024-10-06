import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }
  async create(createProductDto: CreateProductDto) {
    const create = await this.product.create({
      data: createProductDto,
    });
    console.log('create', create);
    return create;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const totalPage = await this.product.count();
    const lastPage = Math.ceil(totalPage / limit);
    const products = await this.product.findMany({
      take: limit,
      skip: limit * (page - 1),
    });
    return {
      data: products,
      metadata: {
        page,
        total: totalPage,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    console.log('finone');
    const product = await this.product.findUnique({
      where: {
        id,
      },
    });
    console.log('product', product);
    if (!product) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;
    return this.product.update({
      where: {
        id,
      },
      data: data,
    });
  }

  remove(id: number) {
    return this.product.delete({
      where: {
        id,
      },
    });
  }
  async validateProducts(ids: number[]) {
    const idsUnique = Array.from(new Set(ids));
    console.log('ids', ids);
    const products = await this.product.findMany({
      where: {
        id: {
          in: idsUnique,
        },
      },
    });
    if (products.length !== idsUnique.length) {
      throw new RpcException({
        message: 'some products not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products;
  }
}
