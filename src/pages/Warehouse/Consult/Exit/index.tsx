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
import { api } from '../../../../services/api';

interface IExit {
  id: string;
  name: string;
  created_at: Date;
  active: boolean;
  user_id: string;
  updated_at: Date;
}

interface IProps {
  exit: IExit[];
  notFound: boolean;
}

export default function categories({ exit }: IProps) {
  const [csvData, setCsvData] = useState([]);
  const [exits, setexits] = useState(exit);
  const [headers, setHeaders] = useState([
    { label: 'USUÁRIO', key: 'users_name' },
    { label: 'INSUMO', key: 'raw_material_name' },
    { label: 'POSIÇÃO', key: 'description' },
    { label: 'QUANTIDADE', key: 'quantity' },
    { label: 'CRIADO EM', key: 'created_at' },
  ]);

  async function handleClickCsvLink(receipt_id) {
    const response = await api.get(`/warehouse/exit/${receipt_id}`);

    setCsvData(response.data);
  }
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
          title: 'Usuário',
          dataIndex: 'users_name',
          key: 'users_name',
          width: '40%',
          ...this.getColumnSearchProps('users_name'),
          sorter: (a, b) => a.users_name.length - b.users_name.length,
        },

        {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '40%',
          ...this.getColumnSearchProps('description'),
          sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
        {
          title: 'Operação',
          key: 'aaa',
          width: '30%',
          render: (record) => {
            return (
              <>
                {csvData.length < 1 && (
                  <Button
                    className={styles.button}
                    style={{
                      borderRadius: '26px',
                      marginTop: '10px',
                      marginLeft: '10px',
                      backgroundColor: '#1c3030',
                    }}
                    onClick={() => {
                      handleClickCsvLink(record.id);
                    }}
                  >
                    <DownloadOutlined style={{ fontSize: '16px' }} />
                  </Button>
                )}

                {csvData.length > 0 && (
                  <Button
                    className={styles.button}
                    style={{
                      borderRadius: '26px',
                      marginTop: '10px',
                      marginLeft: '10px',
                      backgroundColor: '#2F4F4F',
                    }}
                    onClick={() => {
                      handleClickCsvLink(record.id);
                    }}
                  >
                    <CSVLink
                      data={csvData}
                      style={{ color: 'white' }}
                      filename={`Entrada-${format(
                        new Date(),
                        'dd-MM-yyyy'
                      )}.csv`}
                      headers={headers}
                    >
                      <DownloadOutlined style={{ fontSize: '16px' }} />
                    </CSVLink>
                  </Button>
                )}
              </>
            );
          },
        },
      ];
      return (
        <>
          <Table columns={columns} dataSource={exits} />
        </>
      );
    }
  }

  return (
    <Layout>
      <Row justify="end"></Row>
      <SearchTable />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/exit');

    return {
      props: {
        exit: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        categorie: [],
      },
    };
  }
};
