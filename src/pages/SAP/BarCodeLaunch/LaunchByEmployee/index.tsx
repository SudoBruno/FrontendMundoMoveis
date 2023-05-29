import { Button, Col, Divider, Form, Input, Popconfirm, Layout, Modal, Row, Space, Table } from "antd";
import Highlighter from 'react-highlight-words';
import {
  ScanOutlined
} from '@ant-design/icons';

import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

import styles from '../../../styles/app.module.scss';
import React, { useState } from "react";
import { TableHead } from "@material-ui/core";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../../../services/axios";
import { Notification } from "../../../../components/Notification";
import { api } from "../../../../services/api";

import BarcodeReader from 'react-barcode-reader';
import { log } from "console";

interface IProductionOrder {
  id: string;
  document_id: string;
  item_code: string;
  item_description: string;
  warehouse: string;
  unit_of_measurement: string;
}
interface IBarCodes {
  id: string,
  production_order_id: string,
  serial_code: string,
  release_date: Date,
  defect_date: Date,
  created_at: Date,
  updated_at: Date,
  active: boolean,
  user_id: string,
  production_order: IProductionOrder,
}

interface IEmployees {
  name: string,
  employee_id: string,
  id: string,
}

interface IProps {
  barCodesHistory: IBarCodes[],
  barCodesReleasedToday: IBarCodes[],
  employees: IEmployees[],
}

export default function launchBarCodeByEmployee({ barCodesHistory, barCodesReleasedToday, employees }: IProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleClose() {
    setIsModalOpen(false);
  }

  async function handleSave() {
    setIsModalOpen(false);
  }

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
          title: 'Item',
          dataIndex: ['production_order', 'item_description'],
          key: 'item_description',
          width: '40%',
        },
        {
          title: 'Código de Barras',
          dataIndex: 'serial_code',
          key: 'serial_code',
          width: '15%',
        },
        {
          title: 'OP',
          dataIndex: ['production_order', 'document_id'],
          key: 'document_id',
          width: '15%',
        },
        {
          title: 'Lançado em',
          dataIndex: 'release_date',
          key: 'release_date',
          width: '30%',
        },
      ];

      return <Table columns={columns} dataSource={[{}]} />;
    }
  }

  return (
    <div>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<ScanOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Lançar Códigos
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        width={900}
        title="Baixa de Produção"
        open={isModalOpen}
        footer={[
          <Button key="back" type="default" onClick={handleClose}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSave}
          >
            Salvar
          </Button>,
        ]}
      ></Modal>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  try {
    const employee = await apiClient.get('/sap/employee');

    const barCodesHistoryResponse = await apiClient.get('/sap/bar-code/history');

    const barCodesReleasedTodayResponse = await apiClient.get('/sap/bar-code/released-today');

    const employeeData = employee.data;

    const barCodesHistoryData = barCodesHistoryResponse.data;

    const barCodesReleasedTodayData = barCodesReleasedTodayResponse.data;

    barCodesHistoryData.forEach((barCode) => {
      if (barCode.release_date) {
        barCode.release_date = format(
          new Date(barCode.release_date),
          'dd/MM/yyyy HH:mm:ss'
        );
      }

      if (barCode.defect_date) {
        barCode.defect_date = format(
          new Date(barCode.defect_date),
          'dd/MM/yyyy HH:mm:ss'
        );
      }
    });

    barCodesReleasedTodayData.forEach((barCode) => {
      barCode.release_date = format(
        new Date(barCode.release_date),
        'dd/MM/yyyy HH:mm:ss'
      );
    });

    return {
      props: {
        barCodesHistory: barCodesHistoryData,
        barCodesReleasedToday: barCodesReleasedTodayData,
        employees: employeeData,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        barCodesHistory: [{}],
        barCodesReleasedToday: [{}],
        employees: [{}],
      },
    };
  }
};