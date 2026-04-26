import { useState, useEffect } from 'react';

/**
 * Debounce một giá trị trước khi dùng cho search/filter.
 *
 * Hook này giúp giảm số lần gọi API khi người dùng đang gõ. Component sẽ nhận
 * giá trị mới chỉ sau khi input đứng yên đủ `delay` ms.
 *
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian delay (ms), mặc định 500ms
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Mỗi lần value đổi, hủy timer cũ và đặt timer mới.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup đảm bảo chỉ lần nhập cuối cùng trong khoảng delay được áp dụng.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
