import React, { FormEvent, useState } from 'react';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Layout, Row, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import styles from '../../../../styles/app.module.scss';
import { CSVLink } from 'react-csv';
import { Notification } from '../../../../components/Notification';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../../services/axios';
import { format } from 'date-fns';

interface IReceipt {
  id: string;
  name: string;
  created_at: Date;
  active: boolean;
  user_id: string;
  updated_at: Date;
}

interface IProps {
  receipt: IReceipt[];
}

export default function categories({ receipt }: IProps) {
  const [receipts, setReceipts] = useState(receipt);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([
    { label: 'Usuário', key: 'users_name' },
    { label: 'Descrição', key: 'description' },
    { label: 'Criado Em', key: 'created_at' },
  ]);

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput: Input;
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
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '40%',
          ...this.getColumnSearchProps('description'),
          sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Chave Fiscal',
          dataIndex: 'fiscal_key',
          key: 'fiscal_key',
          width: '40%',
          ...this.getColumnSearchProps('fiscal_key'),
          sorter: (a, b) => a.fiscal_key.length - b.fiscal_key.length,
        },
        {
          title: 'Número da Nota',
          dataIndex: 'fiscal_number',
          key: 'fiscal_number',
          width: '40%',
          ...this.getColumnSearchProps('fiscal_number'),
          sorter: (a, b) => a.fiscal_number.length - b.fiscal_number.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
      ];
      return (
        <>
          <Table columns={columns} dataSource={receipts} />
        </>
      );
    }
  }

  return (
    <Layout>
      <Row justify="end">
        <Col>
          <CSVLink
            data={receipts}
            style={{ color: 'white' }}
            filename={`Saída-${format(new Date(), 'dd-MM-yyyy')}.csv`}
            headers={headers}
          >
            <Button
              size={'large'}
              className={styles.button}
              icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
            >
              Baixar Relatório
            </Button>
          </CSVLink>
        </Col>
      </Row>
      <SearchTable />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/receipt');

    return {
      props: {
        receipt: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        receipt: [],
      },
    };
  }
};
