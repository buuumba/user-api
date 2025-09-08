import { IsNumber, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferMoneyDto {
  @ApiProperty({
    description: 'ID пользователя-получателя',
    example: 2,
    type: 'integer',
  })
  @IsInt({ message: 'Recipient ID must be an integer' })
  @IsNotEmpty({ message: 'Recipient ID is required' })
  recipientId: number;

  @ApiProperty({
    description: 'Сумма перевода в долларах',
    example: 25.5,
    minimum: 0.01,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must have at most 2 decimal places' }
  )
  @Min(0.01, { message: 'Amount must be at least $0.01' })
  amount: number;
}
