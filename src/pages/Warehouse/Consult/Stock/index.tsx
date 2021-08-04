import { BarcodeOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  Layout,
  Row,
  Space,
  Table,
  Typography,
} from 'antd';
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { api } from '../../../../services/api';
import Link from 'next/link';
import { getAPIClient } from '../../../../services/axios';

interface IStock {
  id: string;
  quantity: string;
  position_name: string;
  raw_material_name: string;
  raw_material_code: string;
  unit_of_measurement_name: string;
  bar_code: string;
  user_name: string;
}

interface IProp {
  stock: IStock[];
}

const { Title } = Typography;

export default function Stock({ stock }: IProp) {
  const [stocks, setStocks] = useState(stock);

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };

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
        }
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
          title: 'INS',
          dataIndex: 'raw_material_code',
          key: 'raw_material_code',
          width: '15%',
          ...this.getColumnSearchProps('raw_material_code'),
          sorter: (a, b) =>
            a.raw_material_code.length - b.raw_material_code.length,
        },
        {
          title: 'Insumo',
          dataIndex: 'raw_material_name',
          key: 'raw_material_name',
          width: '20%',
          ...this.getColumnSearchProps('raw_material_name'),
          sorter: (a, b) =>
            a.raw_material_name.length - b.raw_material_name.length,
        },
        {
          title: 'Un.Med',
          dataIndex: 'unit_of_measurement_name',
          key: 'unit_of_measurement_name',
          width: '10%',
          ...this.getColumnSearchProps('unit_of_measurement_name'),
          sorter: (a, b) =>
            a.unit_of_measurement_name.length -
            b.unit_of_measurement_name.length,
        },
        {
          title: 'Almoxarifado',
          dataIndex: 'warehouse_name',
          key: ' warehouse_name',
          width: '40%',
          ...this.getColumnSearchProps(' warehouse_name'),
          sorter: (a, b) => a.warehouse_name.length - b.warehouse_name.length,
        },
        {
          title: 'Posição',
          dataIndex: 'position_name',
          key: ' position_name',
          width: '10%',
          ...this.getColumnSearchProps(' position_name'),
          sorter: (a, b) => a.position_name.length - b.position_name.length,
        },
        {
          title: 'Lote',
          dataIndex: 'cargo',
          key: 'cargo',
          width: '10%',
          ...this.getColumnSearchProps('cargo'),
          sorter: (a, b) => a.cargo.length - b.cargo.length,
        },
        {
          title: 'Quantidade',
          dataIndex: 'quantity',
          key: 'quantity',
          width: '10%',
          ...this.getColumnSearchProps('quantity'),
          sorter: (a, b) => a.quantity.length - b.quantity.length,
        },
        {
          title: 'Operação',
          colSpan: 2,
          dataIndex: 'operacao',
          align: 'center',

          render: (record, stock: IStock) => {
            return (
              <a href={`Stock/${stock.bar_code}`} target="_blank">
                <BarcodeOutlined style={{ color: 'black' }} />
              </a>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={stocks} />;
    }
  }

  return (
    <Layout>
      <Row justify="center">
        <Col>
          <Title level={4}>CONSULTAR ESTOQUE</Title>
        </Col>
      </Row>
      <SearchTable />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/stock');

    data.forEach((element) => {
      Object.assign(element, {
        cargo: element.cargo === '' ? 'Generico' : element.cargo,
      });
    });

    return {
      props: {
        stock: data,
      },
    };
  } catch (error) {
    console.error(error);
    return { props: { stock: [] } };
  }
};
