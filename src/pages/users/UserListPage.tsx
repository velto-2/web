import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title } = Typography;

export const UserListPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Team Management</Title>
      <Card>
        <Empty description="User management coming soon..." />
      </Card>
    </div>
  );
};