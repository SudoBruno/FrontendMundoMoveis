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
import { getAPIClient } from "../../../services/axios";
import { Notification } from "../../../components/Notification";
import { api } from "../../../services/api";

import BarcodeReader from 'react-barcode-reader'

import { CopyToClipboard } from 'react-copy-to-clipboard';

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

interface IProps {
  barCodesHistory: IBarCodes[],
  barCodesReleasedToday: IBarCodes[],
}

export default function BarCodeLaunch({ barCodesHistory, barCodesReleasedToday }: IProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [addedSerialCodes, setAddedSerialCodes] = useState([]);
  const [responseDataLaunched, setResponseDataLaunched] = useState([]);
  const [barCodeHistory, setBarCodeHistory] = useState(barCodesHistory);
  const [barCodeReleasedToday, setBarCodeReleasedToday] = useState(barCodesReleasedToday);
  const [serialCode, setSerialCode] = useState({ serial_code: '' });

  async function handleAddSerialCode() {
    if (serialCode.serial_code === '' || serialCode.serial_code.length != 10) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: 'O código deve conter 10 caracteres!',
      })
    }

    const serialCodeAlreadyExists = addedSerialCodes.filter(item => item.serial_code === serialCode.serial_code)

    if (serialCodeAlreadyExists.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: 'O código já está listado!',
      })
    }

    const barCodeAlreadyReleased = barCodeHistory.filter(
      (item) =>
        item.release_date !== null && item.serial_code === serialCode.serial_code
    )

    if (barCodeAlreadyReleased.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código já foi lançado em ${barCodeAlreadyReleased[0].release_date}!`,
      })
    }

    const barCodeAlreadyDefected = barCodeHistory.filter(
      (item) =>
        item.defect_date !== null && item.serial_code === serialCode.serial_code
    )

    if (barCodeAlreadyDefected.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código já foi lançado como defeito em ${barCodeAlreadyDefected[0].defect_date}!`,
      })
    }

    const barCodeUnavailable = barCodeHistory.filter(
      (item) =>
        item.active === false && item.serial_code === serialCode.serial_code
    )

    if (barCodeUnavailable.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código foi desativado!`,
      })
    }

    const barCodeOnHistory = barCodeHistory.filter(
      (item) =>
        item.serial_code === serialCode.serial_code
    );

    let itemDescription = 'Não encontrado';

    if (barCodeOnHistory.length > 0) {
      itemDescription = barCodeOnHistory[0].production_order.item_description
    }

    Notification({
      type: 'success',
      title: 'OK',
      description: 'Código adicionado à lista!',
    })

    setAddedSerialCodes([...addedSerialCodes, { serial_code: serialCode.serial_code, item_description: itemDescription }])

    setSerialCode({ serial_code: '' });
  }

  async function handleClose() {
    setIsModalOpen(false);

    setSerialCode({ serial_code: '' });

    setAddedSerialCodes([]);
  }

  async function handleCloseModalError() {
    setIsModalErrorOpen(false);
  }

  async function handleSave() {
    if (addedSerialCodes.length === 0) {
      handleClose();

      return Notification({
        type: 'error',
        title: 'Erro',
        description: 'Nenhum código bipado!',
      })
    }

    const barCodes = addedSerialCodes.map(item => {
      return item.serial_code;
    })

    const body = {
      serial_codes: barCodes
    }

    try {
      const response = await api.post('/sap/bar-code/launch-production', body);

      const responseData = response.data;

      setResponseDataLaunched(responseData);

      const barCodesLaunched = responseData.bar_codes_launched;

      let barCodeLaunchedText = '';

      barCodesLaunched.forEach((item) => {
        barCodeLaunchedText += `${item.serial_code}`;
      })

      if (barCodesLaunched.length === 0) {
        handleClose();

        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Nenhum código existe!',
        })
      }

      if (barCodesLaunched.length > 0) {
        Notification({
          type: 'success',
          title: `${barCodesLaunched.length} códigos lançados!`,
          description: barCodeLaunchedText,
        })
      }

      await getSerialCodesReleasedToday();

      handleClose();
    } catch (error) {
      console.error(error.response.data.message);

      handleClose();

      Notification({
        type: 'error',
        title: 'Erro',
        description: `${error.response.data.message}`,
      })
    }
  }

  async function handleScan(serialCode: string) {
    if (serialCode === '' || serialCode.length != 10) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: 'O código deve conter 10 caracteres!',
      })
    }

    const serialCodeAlreadyExists = addedSerialCodes.filter(item => item.serial_code === serialCode)

    if (serialCodeAlreadyExists.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: 'O código já está listado!',
      })
    }

    const barCodeAlreadyReleased = barCodeHistory.filter(
      (item) =>
        item.release_date !== null && item.serial_code === serialCode
    )

    if (barCodeAlreadyReleased.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código já foi lançado em ${barCodeAlreadyReleased[0].release_date}!`,
      })
    }

    const barCodeAlreadyDefected = barCodeHistory.filter(
      (item) =>
        item.defect_date !== null && item.serial_code === serialCode
    )

    if (barCodeAlreadyDefected.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código já foi lançado como defeito em ${barCodeAlreadyDefected[0].defect_date}!`,
      })
    }

    const barCodeUnavailable = barCodeHistory.filter(
      (item) =>
        item.active === false && item.serial_code === serialCode
    )

    if (barCodeUnavailable.length > 0) {
      return Notification({
        type: 'error',
        title: 'Erro',
        description: `O código foi desativado!`,
      })
    }

    const barCodeOnHistory = barCodeHistory.filter(
      (item) =>
        item.serial_code === serialCode
    );

    let itemDescription = 'Não encontrado';

    if (barCodeOnHistory.length > 0) {
      itemDescription = barCodeOnHistory[0].production_order.item_description
    }

    Notification({
      type: 'success',
      title: 'OK',
      description: 'Código adicionado à lista!',
    })

    setAddedSerialCodes([...addedSerialCodes, { serial_code: serialCode, item_description: itemDescription }])

    /*                            */
  }

  async function getSerialCodesReleasedToday() {
    const barCodeHistoryResponse = await api.get(`/sap/bar-code/history`);

    const barCodeReleasedTodayResponse = await api.get(`/sap/bar-code/released-today`);

    const barCodesHistoryData = barCodeHistoryResponse.data;

    const barCodesReleasedTodayData = barCodeReleasedTodayResponse.data;

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

    setBarCodeReleasedToday(barCodesReleasedTodayData);

    setBarCodeHistory(barCodesHistoryData);
  }

  async function handleRemoveSerialCode(serialCode: string) {
    const newSerialCodes = addedSerialCodes.filter((item) => {
      if (item.serial_code !== serialCode) {
        return item;
      }
    });

    setAddedSerialCodes(newSerialCodes);
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
          ...this.getColumnSearchProps('item_description'),
        },
        {
          title: 'Código de Barras',
          dataIndex: 'serial_code',
          key: 'serial_code',
          width: '15%',
          ...this.getColumnSearchProps('serial_code'),
        },
        {
          title: 'OP',
          dataIndex: ['production_order', 'document_id'],
          key: 'document_id',
          width: '15%',
          ...this.getColumnSearchProps('document_id'),
        },
        {
          title: 'Lançado em',
          dataIndex: 'release_date',
          key: 'release_date',
          width: '30%',
          ...this.getColumnSearchProps('release_date'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
      ];

      return <Table columns={columns} dataSource={barCodeReleasedToday} />;
    }
  }

  const modalColumns = [
    {
      title: 'Código de Barras',
      dataIndex: 'serial_code',
      key: 'serial_code',
      width: '30%',
    },
    {
      title: 'Descrição do item',
      dataIndex: 'item_description',
      key: 'item_description',
      width: '70%',
    },
    {
      title: 'Operação',
      key: 'bar_code_operation',
      render: (record) => {
        return (
          <>
            <Popconfirm
              title="Confirmar remoção?"
              onConfirm={() => { handleRemoveSerialCode(record.serial_code) }}
            >
              <a href="#" style={{ marginLeft: 20 }}>
                <DeleteOutlined
                  style={{ color: '#ff0000', fontSize: '16px' }}
                />
              </a>
            </Popconfirm>
          </>
        );
      }
    }
  ];

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
        visible={isModalOpen}
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
      >
        <BarcodeReader onScan={handleScan} />
        <Row gutter={5} style={{ flexDirection: 'column' }}>
          <Form.Item
            key="serialCodeFormItem"
            label="Código de Barras"
            style={{ backgroundColor: 'white', fontWeight: 'bold' }}
            required
          >
            <Input
              key="serialCodeInput"
              size="large"
              value={serialCode.serial_code}
              onChange={(e) => setSerialCode({ serial_code: e.target.value })}
            />
          </Form.Item>
          <Button size={'large'} key="launchSerialCode" type="primary" onClick={handleAddSerialCode}>
            Adicionar
          </Button>
        </Row>
        <Divider />
        <Row style={{ display: 'flex', flexDirection: 'column' }}>
          <Table columns={modalColumns} dataSource={addedSerialCodes} />
        </Row>

        <Modal
          visible={isModalErrorOpen}
          title="Códigos com Falha"
          width={500}
          footer={[
            <Button key="back" type="default" onClick={handleCloseModalError}>
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
        >
          {responseDataLaunched.bar_codes_already_released}
        </Modal>
      </Modal>
    </div >
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  try {
    const barCodesHistoryResponse = await apiClient.get('/sap/bar-code/history');

    const barCodesReleasedTodayResponse = await apiClient.get('/sap/bar-code/released-today');

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
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        barCodesHistory: [{}],
        barCodesReleasedToday: [{}],
      },
    };
  }
};