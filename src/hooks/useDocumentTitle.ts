import { useEffect } from 'react';

export default function useDocumentTitle(title: string, fallbackTitle = 'Hệ thống Quản lý CTSV') {
  useEffect(() => {
    document.title = title ? `${title} | CTSV` : fallbackTitle;
  }, [title, fallbackTitle]);
}
