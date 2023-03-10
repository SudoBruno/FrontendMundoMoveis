import { Button, Popconfirm, Col, Divider, Form, Input, Layout, Modal, Row, Space, Table } from "antd";
import Highlighter from 'react-highlight-words';
import {
  ScanOutlined
} from '@ant-design/icons';

import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  BarcodeOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

import styles from '../../../styles/app.module.scss';
import React, { useState } from "react";
import { TableHead } from "@material-ui/core";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../../services/axios";
import { Notification } from "../../../components/Notification";
import { api } from "../../../services/api";

interface IProductionOrder {
  id: string;
  document_id: string;
  item_code: string;
  item_description: string;
  planned_quantity: number;
  unit_of_measurement: string;
  warehouse: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

interface IProps {
  productionOrdersHistory: IProductionOrder[];
}

export default function ProductionOrder({ productionOrdersHistory }: IProps) {
  const [productionOrders, setProductionOrders] = useState(productionOrdersHistory)

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput;
    getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              this.handleSearch(selectedKeys, confirm, dataIndex)
            }
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                this.handleSearch(selectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => this.handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
          : '',
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => this.searchInput.select(), 100);
        } SearchTable
      },
      render: (text) =>
        this.state.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      this.setState({
        searchText: selectedKeys[0],
        searchedColumn: dataIndex,
      });
    };

    handleReset = (clearFilters) => {
      clearFilters();
      this.setState({ searchText: '' });
    };

    render() {
      const columns = [
        {
          title: 'OP',
          dataIndex: 'document_id',
          key: 'document_id',
          width: '10%',
          ...this.getColumnSearchProps('document_id'),
        },
        {
          title: 'Item',
          dataIndex: 'item_description',
          key: 'item_description',
          width: '50%',
          ...this.getColumnSearchProps('item_description'),
        },
        {
          title: 'Quantidade Planejada',
          dataIndex: 'planned_quantity',
          key: 'planned_quantity',
          width: '10%',
          ...this.getColumnSearchProps('planned_quantity'),
        },
        {
          title: 'Criada em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '20%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
        {
          title: 'Operação',
          key: 'operation',
          width: '10%',
          render: (record, productionOrder: IProductionOrder) => {
            return (
              <>
                <a href={`ProductionOrder/${productionOrder.id}`} target="_blank">
                  <BarcodeOutlined style={{ cursor: 'pointer', fontSize: '16px', color: 'black' }} />
                </a>
                <Popconfirm
                  title="Confirmar remoção?"
                >
                  <a href="#" style={{ marginLeft: 20 }}>
                    <DeleteOutlined
                      style={{ color: '#ff0000', fontSize: '16px' }}
                    />
                  </a>
                </Popconfirm>
              </>
            );
          },
        },
      ];

      return <Table columns={columns} dataSource={productionOrders} />;
    }
  }

  return (
    <div>
      <SearchTable />
    </div>
  )

}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  try {
    const productionOrderResponse = await apiClient.get('/sap/production-order');

    const productionOrders = productionOrderResponse.data;

    productionOrders.forEach((productionOrder) => {
      if (productionOrder.created_at) {
        productionOrder.created_at = format(
          new Date(productionOrder.created_at),
          'dd/MM/yyyy HH:mm'
        );
      }
    });

    return {
      props: {
        productionOrdersHistory: productionOrders,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        productionOrdersHistory: [{}],
      },
    };
  }
};