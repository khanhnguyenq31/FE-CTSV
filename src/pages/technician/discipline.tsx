import React, { useState } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, InputNumber, notification, Select, Space, Popconfirm, Switch } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDisciplineForms, createDisciplineForm, updateDisciplineForm, deleteDisciplineForm,
    getDisciplineConfigs, createDisciplineConfig, updateDisciplineConfig, deleteDisciplineConfig
} from '../../api/discipline';
import type { DisciplineForm, DisciplineConfig } from '../../api/discipline';

const { TabPane } = Tabs;

export default function DisciplinePage() {
    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Quản lý Kỷ luật sinh viên</h2>
            <Tabs defaultActiveKey="1" style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
                <TabPane tab="Hình thức kỷ luật" key="1">
                    <DisciplineFormTab />
                </TabPane>
                <TabPane tab="Cấu hình kỷ luật" key="2">
                    <DisciplineConfigTab />
                </TabPane>
            </Tabs>
        </div>
    );
}

function DisciplineFormTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const { data: forms, isLoading } = useQuery({ queryKey: ['disciplineForms'], queryFn: getDisciplineForms });

    const mutationCreate = useMutation({
        mutationFn: createDisciplineForm,
        onSuccess: () => {
            notification.success({ message: 'Thêm hình thức kỷ luật thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineForm(id, data),
        onSuccess: () => {
            notification.success({ message: 'Cập nhật thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationDelete = useMutation({
        mutationFn: deleteDisciplineForm,
        onSuccess: () => {
            notification.success({ message: 'Xóa thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
        }
    });

    const handleOpenModal = (record?: DisciplineForm) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue(record);
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleFinish = (values: any) => {
        if (editingId) mutationUpdate.mutate({ id: editingId, data: values });
        else mutationCreate.mutate(values);
    };

    const columns = [
        { title: 'Mã', dataIndex: 'maHinhThuc', key: 'maHinhThuc' },
        { title: 'Tên hình thức', dataIndex: 'tenHinhThuc', key: 'tenHinhThuc' },
        { title: 'Chuyển trạng thái học', dataIndex: 'chuyenTrangThaiHoc', key: 'chuyenTrangThaiHoc', render: (val: boolean) => val ? 'Có' : 'Không' },
        {
            title: 'Thao tác', key: 'action',
            render: (_: any, record: DisciplineForm) => (
                <Space>
                    <Button type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa hình thức này?" onConfirm={() => mutationDelete.mutate(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>Thêm hình thức kỷ luật</Button>
            <Table rowKey="id" columns={columns} dataSource={forms} loading={isLoading} />
            <Modal
                title={editingId ? 'Sửa hình thức kỷ luật' : 'Thêm hình thức kỷ luật'}
                open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="maHinhThuc" label="Mã hình thức" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="tenHinhThuc" label="Tên hình thức" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="chuyenTrangThaiHoc" label="Chuyển trạng thái học" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

function DisciplineConfigTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const { data: configs, isLoading } = useQuery({ queryKey: ['disciplineConfigs'], queryFn: getDisciplineConfigs });
    const { data: forms } = useQuery({ queryKey: ['disciplineForms'], queryFn: getDisciplineForms });

    const mutationCreate = useMutation({
        mutationFn: createDisciplineConfig,
        onSuccess: () => {
            notification.success({ message: 'Thêm cấu hình thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsModalOpen(false);
        }
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineConfig(id, data),
        onSuccess: () => {
            notification.success({ message: 'Cập nhật thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsModalOpen(false);
        }
    });

    const mutationDelete = useMutation({
        mutationFn: deleteDisciplineConfig,
        onSuccess: () => {
            notification.success({ message: 'Xóa thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
        }
    });

    const handleOpenModal = (record?: DisciplineConfig) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue(record);
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleFinish = (values: any) => {
        if (editingId) mutationUpdate.mutate({ id: editingId, data: values });
        else mutationCreate.mutate(values);
    };

    const columns = [
        { title: 'Hình thức kỷ luật', key: 'hinhThuc', render: (_: any, record: DisciplineConfig) => `${record.hinhThuc?.maHinhThuc} - ${record.hinhThuc?.tenHinhThuc}` },
        { title: 'Điểm GPA tối thiểu', dataIndex: 'minDiem', key: 'minDiem' },
        { title: 'Điểm GPA tối đa', dataIndex: 'maxDiem', key: 'maxDiem' },
        {
            title: 'Thao tác', key: 'action',
            render: (_: any, record: DisciplineConfig) => (
                <Space>
                    <Button type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa cấu hình này?" onConfirm={() => mutationDelete.mutate(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>Thêm cấu hình (GPA)</Button>
            <Table rowKey="id" columns={columns} dataSource={configs} loading={isLoading} />
            <Modal
                title={editingId ? 'Sửa cấu hình' : 'Thêm cấu hình'}
                open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="hinhThucId" label="Chọn hình thức kỷ luật" rules={[{ required: true }]}>
                        <Select>
                            {forms?.map((f: DisciplineForm) => (
                                <Select.Option key={f.id} value={f.id}>{f.maHinhThuc} - {f.tenHinhThuc}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="minDiem" label="Điểm trung bình (GPA) từ:" rules={[{ required: true }]}>
                        <InputNumber step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="maxDiem" label="Điểm trung bình (GPA) đến:" rules={[{ required: true }]}>
                        <InputNumber step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
