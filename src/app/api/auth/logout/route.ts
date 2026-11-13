
import { NextResponse } from 'next/server';

export async function POST() {
  // Создаем ответ с удалением cookie
  const response = NextResponse.json({ message: 'Выход выполнен успешно' });
  
  // Удаляем cookie с токеном
  response.cookies.delete('token');
  
  return response;
}
