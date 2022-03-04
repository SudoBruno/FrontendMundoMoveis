import React, { useEffect, useState } from 'react';
import {
    DeleteOutlined,
    EditFilled,
    PlusOutlined,
    SearchOutlined,
    MinusCircleOutlined,
    EyeOutlined,
    CloseOutlined
} from '@ant-design/icons';
import {
    Button,
    Col,
    Form,
    Input,
    Layout,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Upload,
} from 'antd';

import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';

import { Divider } from 'antd';


interface ITolerance {
    id: string,
    type: string,
    classification: string,
}

interface IProps {
    tolerance: ITolerance[];
}

export default function WorkElement({ tolerance }: IProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tolerances, setTolerances] = useState(
        [
            { id: 1, type: 'Esforço Físico', classification: 'Posição em pé ou sentado 2kg' },
            { id: 2, type: 'Esforço Físico', classification: 'Posição em pé ou sentado 4kg' },
            { id: 3, type: 'Esforço Físico', classification: 'Posição em pé ou sentado 6kg' },
            { id: 4, type: 'Esforço Físico', classification: 'Posição em pé ou sentado 8kg' },
            { id: 5, type: 'Temperatura', classification: '10 a 15' },
            { id: 6, type: 'Temperatura', classification: '16 a 22' },
            { id: 7, type: 'Temperatura', classification: '23 a 28' },
            { id: 8, type: 'Temperatura', classification: '29 a 35' },
        ]
    )

    return (
        <div>index</div>
    )
};


export const getServerSideProps: GetServerSideProps = async (context) => {
    const apiClient = getAPIClient(context);
    try {
        const { data } = await apiClient.get('/workelement');

        return {
            props: {
                workelement: data,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            props: {
                workelement: [],
            },
        };
    }
};