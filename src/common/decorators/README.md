# API Response Decorators

This directory contains powerful decorators for customizing API responses in a declarative way.

## Quick Start

```typescript
import { ApiSuccess, ApiResponse, ApiError, RawResponse } from 'common/decorators';

@Controller('users')
export class UsersController {
  @ApiSuccess('User created successfully')
  @Post()
  async create(@Body() data: CreateUserDto) {
    return await this.usersService.create(data);
  }

  @ApiError('User not found', 404)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }
}
```

## Available Decorators

### `@ApiSuccess(message?, options?)`

Wraps the response with `ApiResponse.success()` and custom message.

```typescript
@ApiSuccess('Operation completed successfully')
@Get('data')
async getData() {
  return { items: [] };
}

// Response:
// {
//   "success": true,
//   "message": "Operation completed successfully",
//   "data": { "items": [] }
// }
```

### `@ApiResponse(statusCode, message?, options?)`

Creates custom responses with specific HTTP status codes.

```typescript
@ApiResponse(201, 'User created successfully')
@Post('users')
async createUser(@Body() data: any) {
  return await this.usersService.create(data);
}

// Response with HTTP 201 status code
```

### `@ApiError(message?, statusCode?)`

Creates error responses with custom messages and status codes.

```typescript
@ApiError('Invalid credentials', 401)
@Post('login')
async login(@Body() credentials: any) {
  // Validation logic
  if (!isValid(credentials)) {
    throw new Error('Invalid credentials');
  }
  return { token: '...' };
}

// Response:
// {
//   "success": false,
//   "message": "Invalid credentials",
//   "statusCode": 401
// }
```

### `@RawResponse()`

Bypasses automatic `ApiResponse` wrapping for raw responses (files, streams, etc.).

```typescript
@RawResponse()
@Get('export')
async exportData() {
  return this.excelService.generateExcelFile();
}

// Returns raw file stream without ApiResponse wrapper
```

## Advanced Options

### Custom Metadata

```typescript
@ApiSuccess('Users retrieved', {
  metadata: {
    total: 100,
    page: 1,
    limit: 10
  }
})
```

### Custom Headers

```typescript
@ApiSuccess('File uploaded', {
  headers: {
    'X-Upload-Id': '12345',
    'Cache-Control': 'no-cache'
  }
})
```

### Custom Status Code

```typescript
@ApiSuccess('Payment processed', {
  statusCode: 202  // Accepted
})
```

### Response Transformation

```typescript
@ApiSuccess('Data transformed', {
  transform: (response) => ({
    ...response,
    timestamp: new Date().toISOString(),
    version: '1.0'
  })
})
```

### Disable Request ID

```typescript
@ApiSuccess('Quick response', {
  includeRequestId: false  // Don't include request ID
})
```

## Usage Examples

### Basic CRUD Operations

```typescript
@Controller('products')
export class ProductsController {
  @ApiSuccess('Product created successfully')
  @Post()
  async create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @ApiSuccess('Products retrieved successfully')
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @ApiSuccess('Product found')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiSuccess('Product updated successfully')
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(+id, data);
  }

  @ApiResponse(204, 'Product deleted successfully')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(+id);
    return {}; // 204 responses typically have empty body
  }
}
```

### File Operations

```typescript
@Controller('files')
export class FilesController {
  @RawResponse()
  @Get(':filename')
  async getFile(@Param('filename') filename: string) {
    return this.filesService.getFileStream(filename);
  }

  @ApiSuccess('File uploaded successfully', {
    headers: {
      'X-Upload-Id': 'generated-id'
    }
  })
  @Post('upload')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.saveFile(file);
    return result;
  }
}
```

### Authentication

```typescript
@Controller('auth')
export class AuthController {
  @ApiSuccess('Login successful', {
    metadata: { tokenType: 'Bearer' }
  })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @ApiError('Invalid refresh token', 401)
  @Post('refresh')
  async refresh(@Body() data: RefreshTokenDto) {
    return this.authService.refresh(data.token);
  }

  @ApiSuccess('Logged out successfully')
  @Post('logout')
  async logout(@Body() data: LogoutDto) {
    await this.authService.logout(data.token);
    return {};
  }
}
```

## Priority Order

When multiple decorators are applied to the same method, they are processed in this order:

1. `@RawResponse()` - Highest priority, bypasses all wrapping
2. `@ApiError()` - Creates error response
3. `@ApiResponse()` - Creates custom response
4. `@ApiSuccess()` - Creates success response
5. Default behavior - Standard `ApiResponse.success()` wrapping

## Integration with Response Interceptor

These decorators work seamlessly with the `ResponseInterceptor` which automatically:

- Wraps responses based on decorator metadata
- Handles request IDs
- Sets appropriate HTTP status codes
- Applies custom headers
- Transforms responses as needed

## Best Practices

1. **Use meaningful messages**: Choose messages that clearly describe the operation result
2. **Consistent status codes**: Use appropriate HTTP status codes for different operations
3. **Raw responses for files**: Use `@RawResponse()` for file downloads and streams
4. **Custom headers**: Set appropriate headers for caching, CORS, etc.
5. **Error handling**: Use `@ApiError()` for expected error scenarios
6. **Metadata**: Include pagination info, totals, etc. in metadata

## Migration from Manual ApiResponse

### Before
```typescript
@Post('users')
async create(@Body() data: CreateUserDto) {
  const user = await this.usersService.create(data);
  return ApiResponse.success(user, 'User created successfully');
}
```

### After
```typescript
@ApiSuccess('User created successfully')
@Post('users')
async create(@Body() data: CreateUserDto) {
  return await this.usersService.create(data);
}
```

This approach reduces boilerplate code and makes your controllers more readable and maintainable.
