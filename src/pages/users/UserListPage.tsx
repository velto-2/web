import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Input,
  Select,
  Modal,
  Form,
  Switch,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useUsers,
  useDeleteUser,
  useInviteUser,
  useUpdateUser,
} from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const UserListPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [inviteForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: usersData, isLoading } = useUsers({
    page,
    limit: pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteUser = useDeleteUser();
  const inviteUser = useInviteUser();
  const updateUser = useUpdateUser();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();

  const handleInvite = async (values: any) => {
    try {
      await inviteUser.mutateAsync(values);
      setIsInviteModalVisible(false);
      inviteForm.resetFields();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: values,
      });
      setIsEditModalVisible(false);
      setEditingUser(null);
      editForm.resetFields();
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'default';
      case 'PENDING_INVITATION':
        return 'orange';
      case 'SUSPENDED':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: any) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (record: any) => (
        <Space>
          {record.roles?.map((role: any) => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          )) || <Tag>No roles</Tag>}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={() => deleteUser.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger icon={<DeleteOutlined />}
              loading={deleteUser.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Team Management</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsInviteModalVisible(true)}
        >
          Invite User
        </Button>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space>
            <Search
              placeholder="Search users..."
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={setStatusFilter}
            >
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="PENDING_INVITATION">Pending</Option>
              <Option value="SUSPENDED">Suspended</Option>
            </Select>
          </Space>

          <Table
            columns={columns}
            dataSource={usersData?.data || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize,
              total: usersData?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
              },
            }}
          />
        </Space>
      </Card>

      {/* Invite User Modal */}
      <Modal
        title="Invite User"
        open={isInviteModalVisible}
        onCancel={() => {
          setIsInviteModalVisible(false);
          inviteForm.resetFields();
        }}
        onOk={() => inviteForm.submit()}
        confirmLoading={inviteUser.isPending}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInvite}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="John" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Doe" />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="Assign Role(s)"
            rules={[{ required: true, message: 'Please select at least one role' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select role(s)"
              loading={isLoadingRoles}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const children = option?.children;
                if (Array.isArray(children)) {
                  return children.some((child: any) =>
                    String(child).toLowerCase().includes(input.toLowerCase())
                  );
                }
                return String(children || '').toLowerCase().includes(input.toLowerCase());
              }}
            >
              {rolesData?.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateUser.isPending}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
