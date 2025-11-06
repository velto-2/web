import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title } = Typography;

export const OfferListPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>My Offers</Title>
      <Card>
        <Empty description="Offer management coming soon..." />
      </Card>
    </div>
  );
};