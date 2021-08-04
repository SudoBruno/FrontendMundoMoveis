import React, { FormEvent, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';

import Highlighter from 'react-highlight-words';
import styles from '../../../../styles/app.module.scss';

import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface IRawMaterial {
  id: string;
  name: string;
  unit_measurement_name: string;
  code: string;
}
interface IStorage {
  id: string;
  quantity: number;
  cargo: string;
  position_name: string;
  position_id: string;
  raw_material_name: string;
}

interface IWarehouse {
  id: string;
  name: string;
}

interface IStorageProps {
  rawMaterial: IRawMaterial[];
  storage: IStorage[];
  warehouse: IWarehouse[];
}

export default function Storage({
  rawMaterial,
  storage,
  warehouse,
}: IStorageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [storageId, setStorageId] = useState('');
  const [rawMaterials, setRawMaterials] = useState(rawMaterial);
  const [storages, setStorages] = useState(storage);
  const [warehouses, setWarehouses] = useState(warehouse);
  const [positions, setPositions] = useState([{ id: '', name: '' }]);
  const [receipts, setReceipts] = useState([
    {
      warehouse_receipt_description: '',
      warehouse_raw_material_name: '',
      raw_material_id: '',
      receipt_id: '',
      unitary_value: 0,
      grade_value: 0,
      quantity: '',
      id: '',
    },
  ]);

  const [rawMaterialsAdded, setRawMaterialsAdded] = useState([
    {
      raw_material_id: '',
      quantity: '',
      cargo: '',
      position_id: '',
      raw_material_receipt_id: '',
      rawMaterialName: '',
      receiptName: '',
      maxQuantity: 0,
      warehouse_id: '',
      warehouseName: '',
      positionName: '',
      quantityHasToStorage: '',
    },
  ]);

  async function handleRegister(e) {
    e.preventDefault();

    if (storageId) {
      try {
      } catch (error) {}
    } else {
      try {
        const storagesForAdd = {
          storageRawMaterials: rawMaterialsAdded,
        };

        setLoading(true);
        const response = await api.post('/warehouse/storage', storagesForAdd);

        const newRawMaterialAddedRegistered = response.data;
        storages.push(newRawMaterialAddedRegistered);
        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Armazenamento feito com sucesso',
        });

        handleClose();
      } catch (error) {
        console.error(error);

        setLoading(false);

        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível armazenar',
        });
      }
    }
  }

  function addNewStorage() {
    const newArray = [
      ...rawMaterialsAdded,
      {
        raw_material_id: '',
        quantity: '',
        cargo: '',
        position_id: '',
        raw_material_receipt_id: '',
        rawMaterialName: '',
        receiptName: '',
        maxQuantity: 0,
        warehouse_id: '',
        warehouseName: '',
        positionName: '',
        quantityHasToStorage: '',
      },
    ];
    setRawMaterialsAdded(newArray);
  }

  function handleClose() {
    setPositions([{ id: '', name: '' }]);
    setReceipts([
      {
        warehouse_receipt_description: '',
        warehouse_raw_material_name: '',
        raw_material_id: '',
        receipt_id: '',
        unitary_value: 0,
        grade_value: 0,
        quantity: '',
        id: '',
      },
    ]);
    setRawMaterialsAdded([
      {
        raw_material_id: '',
        quantity: '',
        cargo: '',
        position_id: '',
        raw_material_receipt_id: '',
        rawMaterialName: '',
        receiptName: '',
        maxQuantity: 0,
        warehouse_id: '',
        warehouseName: '',
        positionName: '',
        quantityHasToStorage: '',
      },
    ]);
    setLoading(false);
    setIsModalOpen(false);
  }

  function removeReceivement(indexOfItem: number) {
    let newArray = [...rawMaterialsAdded];
    newArray.splice(indexOfItem, 1);
    setRawMaterialsAdded(newArray);
  }

  function handleEdit(data: IStorage) {}

  function handleChangeCargo(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].cargo = value;

    setRawMaterialsAdded(newArray);
  }

  function handleChangeRawMaterial(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].raw_material_id = value[0];
    newArray[
      index
    ].rawMaterialName = `${value[3]} | ${value[1]} / (${value[2]})`;

    setRawMaterialsAdded(newArray);
  }

  async function handleClickReceipt(index) {
    const newArray = [...rawMaterialsAdded];
    setLoadingReceipt(true);
    const response = await api.get(`/warehouse/receipt/raw-material`, {
      params: { raw_material_id: newArray[index].raw_material_id },
    });

    setReceipts(response.data);
    setLoadingReceipt(false);
  }

  function handleChangeReceipt(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].raw_material_receipt_id = value[4];
    newArray[index].receiptName = value[2];

    let maxQuantity: number = Number(value[3]);

    rawMaterialsAdded.forEach((item) => {
      if (item.raw_material_receipt_id === value[4]) {
        maxQuantity -= Number(item.quantity);
      }
    });

    newArray[index].maxQuantity = maxQuantity;
    newArray[index].quantityHasToStorage = value[3];

    setRawMaterialsAdded(newArray);
  }

  async function handleChangeWarehouse(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].warehouse_id = value[0];
    newArray[index].warehouseName = value[1];

    newArray[index].position_id = '';
    newArray[index].positionName = '';

    setRawMaterialsAdded(newArray);

    const response = await api.get(`/warehouse/position`, {
      params: { warehouse_id: newArray[index].warehouse_id },
    });

    setPositions(response.data);
  }

  function handleChangeQuantity(value, index) {
    let newArray = [...rawMaterialsAdded];

    if (value > Number(newArray[index].maxQuantity)) {
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'valor maior que o esperado',
      });
      newArray[index].quantity = '';
      setRawMaterialsAdded(newArray);
      return;
    }

    if (value < 0) {
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Valor negativo ou 0',
      });
      newArray[index].quantity = '';
      setRawMaterialsAdded(newArray);
      return;
    }

    let maxQuantity: number = Number(newArray[index].quantityHasToStorage);

    rawMaterialsAdded.forEach((item, itemIndex) => {
      if (
        item.raw_material_receipt_id ===
          newArray[index].raw_material_receipt_id &&
        itemIndex !== index
      ) {
        maxQuantity -= Number(item.quantity);
      }
    });

    newArray[index].quantity = value;
    newArray[index].maxQuantity = maxQuantity;
    setRawMaterialsAdded(newArray);
  }

  function calculateQuanityPerAddedRawMaterial(index, array, rawMaterialId) {
    const equalValues = array.filter((iten) => {
      if (iten.raw_material_id === rawMaterialId) {
        return iten;
      }
    });
  }

  function handleChangePosition(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].position_id = value[0];
    newArray[index].positionName = value[1];

    setRawMaterialsAdded(newArray);
  }
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
          title: 'Usuário',
          dataIndex: 'user_name',
          key: 'user_name',
          width: '30%',
          ...this.getColumnSearchProps('user_name'),
          sorter: (a, b) => a.user_name.length - b.user_name.length,
        },
        {
          title: 'Insumo',
          dataIndex: 'raw_material_name',
          key: 'raw_material_name',
          width: '30%',
          ...this.getColumnSearchProps('raw_material_name'),
          sorter: (a, b) =>
            a.raw_material_name.length - b.raw_material_name.length,
        },
        {
          title: 'Almoxarifado',
          dataIndex: 'warehouse_name',
          key: 'warehouse_name',
          width: '30%',
          ...this.getColumnSearchProps('warehouse_name'),
          sorter: (a, b) => a.warehouse_name.length - b.warehouse_name.length,
        },
        {
          title: 'Posição',
          dataIndex: 'position_name',
          key: 'position_name',
          width: '30%',
          ...this.getColumnSearchProps('position_name'),
          sorter: (a, b) => a.position_name.length - b.position_name.length,
        },
        {
          title: 'Quantidade',
          dataIndex: 'quantity',
          key: 'quantity',
          width: '30%',
          ...this.getColumnSearchProps('quantity'),
          sorter: (a, b) => a.quantity.length - b.quantity.length,
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
          key: 'operation',
          render: (record) => {
            return (
              <>
                <EditFilled
                  style={{ cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => handleEdit(record)}
                />
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={storages} />;
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
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Realizar Armazenagem
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        width={800}
        title="Armazenagem"
        visible={isModalOpen}
        footer={[
          <Button key="back" onClick={handleClose} type="default">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        {rawMaterialsAdded.map((selectedIten, index) => (
          <>
            <Row gutter={5}>
              <Col span={8}>
                <Form.Item
                  key="storageCargoFormItem"
                  labelCol={{ span: 23 }}
                  label="Lote"
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                >
                  <Input
                    key="storageCargo"
                    size="large"
                    placeholder="Digite o nome do Lote "
                    value={selectedIten.cargo}
                    onChange={(e) => {
                      handleChangeCargo(e.target.value, index);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={17}>
                <Form.Item
                  key="formItemRawMaterials"
                  labelCol={{ span: 23 }}
                  label="Insumo: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '140%', marginBottom: '10px' }}
                    placeholder="Selecion o insumo"
                    optionFilterProp="children"
                    value={selectedIten.rawMaterialName}
                    //disabled={isLockInsChange}
                    onChange={(e) => {
                      handleChangeRawMaterial(e, index);
                    }}
                  >
                    {rawMaterials.map((item) => (
                      <>
                        <Option
                          key={item.id}
                          value={[
                            item.id,
                            item.name,
                            item.unit_measurement_name,
                            item.code,
                          ]}
                        >
                          {`${item.code} |
                            ${item.name} / 
                            (${item.unit_measurement_name})`}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={7}>
                <Form.Item
                  key="formItemReceipts"
                  labelCol={{ span: 23 }}
                  label="Entrada: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    loading={loadingReceipt}
                    style={{ width: '140%', marginBottom: '10px' }}
                    placeholder="Selecion a entrada"
                    optionFilterProp="children"
                    value={selectedIten.receiptName}
                    disabled={selectedIten.rawMaterialName != '' ? false : true}
                    onClick={() => {
                      handleClickReceipt(index);
                    }}
                    onChange={(e) => {
                      handleChangeReceipt(e, index);
                    }}
                  >
                    {receipts.map((item) => (
                      <>
                        <Option
                          key={item.receipt_id}
                          value={[
                            item.receipt_id,
                            item.warehouse_raw_material_name,
                            item.warehouse_receipt_description,
                            item.quantity,
                            item.id,
                          ]}
                        >
                          {item.warehouse_receipt_description}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={6} style={{ marginRight: '0.5rem' }}>
                <Form.Item
                  key="formItemReceipts"
                  labelCol={{ span: 23 }}
                  label="Almoxarifado: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '100%', marginRight: '10px' }}
                    optionFilterProp="children"
                    disabled={selectedIten.receiptName != '' ? false : true}
                    value={selectedIten.warehouseName}
                    onChange={(e) => {
                      handleChangeWarehouse(e, index);
                    }}
                  >
                    {warehouses.map((item) => (
                      <>
                        <Option key={item.id} value={[item.id, item.name]}>
                          {item.name}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} style={{ marginRight: '0.5rem' }}>
                <Form.Item
                  key="formItemReceipts"
                  labelCol={{ span: 23 }}
                  label="Posição: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '100%', marginRight: '10px' }}
                    placeholder="Selecion a entrada"
                    optionFilterProp="children"
                    value={selectedIten.positionName}
                    disabled={selectedIten.warehouseName != '' ? false : true}
                    onChange={(e) => {
                      handleChangePosition(e, index);
                    }}
                  >
                    {positions.map((item) => (
                      <>
                        <Option key={item.id} value={[item.id, item.name]}>
                          {item.name}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  key="formQuantity"
                  labelCol={{ span: 23 }}
                  label="Quantidade: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    marginRight: '5%',
                  }}
                  required
                >
                  <Input
                    type="number"
                    key="quantiyKey"
                    size="large"
                    value={selectedIten.quantity}
                    disabled={selectedIten.positionName != '' ? false : true}
                    onChange={(e) => {
                      handleChangeQuantity(e.target.value, index);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  key="formTotalValue"
                  labelCol={{ span: 23 }}
                  label="Falta Armazenar: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                  }}
                  required
                >
                  <Input
                    type="number"
                    key="totalValueKey"
                    size="large"
                    disabled={true}
                    value={selectedIten.maxQuantity}
                    style={{ width: '80%', marginRight: '5%' }}
                  />
                  {rawMaterialsAdded.length != 1 && (
                    <MinusCircleOutlined
                      style={{ color: 'red' }}
                      onClick={() => removeReceivement(index)}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            {rawMaterialsAdded.length - 1 === index && (
              <Button
                key="primary"
                title="Nova Armazenagem"
                style={{
                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                disabled={selectedIten.quantity != '' ? false : true}
                onClick={addNewStorage}
              >
                <PlusOutlined />
                Nova Armazenagem
              </Button>
            )}
          </>
        ))}
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  try {
    const rawMaterialResponse = await apiClient.get('/warehouse/raw-material');
    const storageResponse = await apiClient.get('/warehouse/storage');
    const warehouseResponse = await apiClient.get('/warehouse/warehouse');

    const rawMaterialData = rawMaterialResponse.data;
    const storageData = storageResponse.data;
    const warehouseData = warehouseResponse.data;

    return {
      props: {
        rawMaterial: rawMaterialData,
        storage: storageData,
        warehouse: warehouseData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        rawMaterial: [{}],
        storage: [{}],
        warehouse: [{}],
      },
    };
  }
};
