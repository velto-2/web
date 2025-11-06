import React from 'react';
import { Skeleton, Card } from 'antd';

interface SkeletonLoaderProps {
  rows?: number;
  active?: boolean;
  card?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 3,
  active = true,
  card = false,
}) => {
  const content = <Skeleton active={active} paragraph={{ rows }} />;

  if (card) {
    return <Card>{content}</Card>;
  }

  return content;
};

