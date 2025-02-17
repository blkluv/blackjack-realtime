import { generateRandomString } from '@/atoms/atom';
import { useState } from 'react';
export const useStaticId = () => {
  const localStorage = window.localStorage;

  const [staticId, setStaticId] = useState(localStorage.getItem('staticId'));

  if (!staticId) {
    const newStaticId = generateRandomString(8);
    localStorage.setItem('staticId', newStaticId);
    setStaticId(newStaticId);
  }

  return staticId;
};
