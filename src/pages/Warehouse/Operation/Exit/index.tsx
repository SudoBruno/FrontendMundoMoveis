import React, { FormEvent, useState } from 'react';

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
import BarcodeReader from 'react-barcode-reader';
import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface IRawMaterial {
  raw_material_id: string;
  raw_material_name: string;
  unit_of_measurement_abbreviation: string;
  raw_material_code: string;
}

interface IWarehouse {
  id: string;
  name: string;
}

interface IReaceivment {
  id: string;
  description: string;
  fiscal_key: string;
  fiscal_number: string;
}

interface IExit {
  id: string;
}
interface IProp {
  rawMaterial: IRawMaterial[];
  exit: IExit[];
  warehouse: IWarehouse[];
}

export default function Receivement({ rawMaterial, exit, warehouse }: IProp) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLockInsChange, setIsLockInsChange] = useState(false);
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [exits, setExits] = useState(exit);
  const [rawMaterials, setRawMaterials] = useState(rawMaterial);
  const [warehouses, setWarehouses] = useState(warehouse);
  const [positions, setPositions] = useState([{ id: '', name: '' }]);
  const [cargo, setCargo] = useState([]);
  const [rawMaterialsAdded, setRawMaterialsAdded] = useState([
    {
      quantity: '',
      cargo: '',
      raw_material_id: '',
      position_id: '',
      warehouse_id: '',
      maxQuantity: 0,
      warehouseName: '',
      positionName: '',
      rawMaterialName: '',
      stillRemains: 0,
    },
  ]);

  async function handleRegister(e: FormEvent) {
    try {
      if (description === '') {
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Nenhum campo pode ser vazio',
        });
        setLoading(false);
        return;
      }
      let data = {
        description: description,
      };
      setLoading(true);
      let response = await api.post('/warehouse/exit', data);
      setLoading(false);

      rawMaterialsAdded.forEach((iten) => {
        if (iten.cargo === 'Genérico') {
          return (iten.cargo = '');
        }
      });

      let exitData = { raw_materials: rawMaterialsAdded };

      const responseExitRawMaterial = await api.post(
        `/warehouse/exit/${response.data.id}`,
        exitData
      );

      const newExitRegistered = response.data;
      exit.push(newExitRegistered);

      setLoading(false);
      Notification({
        type: 'success',
        title: 'Enviado',
        description: 'Recebimento feito com sucesso',
      });
      handleClose();
    } catch (error) {
      setLoading(false);
      Notification({
        type: 'error',
        title: 'Erro',
        description: `${error.response.data.message}`,
      });
    }
  }

  function handleClickWarehouse(index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].position_id = '';
    newArray[index].positionName = '';
    setPositions([{ id: '', name: '' }]);
    setRawMaterialsAdded(newArray);
  }

  function handleChangeWarehouse(value, index) {
    let newArray = [...rawMaterialsAdded];

    const warehouse = warehouses.find((warehouse) => warehouse.id === value);

    newArray[index].warehouse_id = warehouse.id;
    newArray[index].warehouseName = warehouse.name;

    newArray[index].position_id = '';
    newArray[index].positionName = '';

    setRawMaterialsAdded(newArray);

    setPositions;
    clickPosition(index);
  }

  async function clickPosition(index) {
    let newArray = [...rawMaterialsAdded];

    const response = await api.get(`/warehouse/position`, {
      params: {
        warehouse_id: newArray[index].warehouse_id,
        raw_material_id: newArray[index].raw_material_id,
      },
    });

    setPositions(response.data);
  }
  function handleChangePosition(value, index) {
    let newArray = [...rawMaterialsAdded];

    const position = positions.find((position) => position.id === value);

    newArray[index].position_id = position.id;
    newArray[index].positionName = position.name;
    newArray[index].cargo = '';

    setRawMaterialsAdded(newArray);
  }

  async function handleClose() {
    setRawMaterialsAdded([
      {
        quantity: '',
        cargo: '',
        raw_material_id: '',
        position_id: '',
        warehouse_id: '',
        maxQuantity: 0,
        warehouseName: '',
        positionName: '',
        rawMaterialName: '',
        stillRemains: 0,
      },
    ]);
    setId('');
    setIsModalOpen(false);
    setLoading(false);
  }

  function addNewExit() {
    const newArray = [
      ...rawMaterialsAdded,
      {
        quantity: '',
        cargo: '',
        raw_material_id: '',
        position_id: '',
        warehouse_id: '',
        maxQuantity: 0,
        warehouseName: '',
        positionName: '',
        rawMaterialName: '',
        stillRemains: 0,
      },
    ];
    setRawMaterialsAdded(newArray);
  }

  function removeExit(indexOfItem: number) {
    let newArray = [...rawMaterialsAdded];
    newArray.splice(indexOfItem, 1);
    setRawMaterialsAdded(newArray);
  }

  function handleChangeRawMaterial(value, index: number) {
    let newArray = [...rawMaterialsAdded];
    const rawMaterial = rawMaterials.find(
      (rawMaterial) => rawMaterial.raw_material_id === value
    );

    newArray[index].raw_material_id = rawMaterial.raw_material_id;
    newArray[
      index
    ].rawMaterialName = `${rawMaterial.raw_material_code} | ${rawMaterial.raw_material_name} / (${rawMaterial.unit_of_measurement_abbreviation})`;

    newArray[index].warehouse_id = '';
    newArray[index].warehouseName = '';
    newArray[index].position_id = '';
    newArray[index].positionName = '';

    newArray[index].quantity = '';
    newArray[index].maxQuantity = 0;

    setRawMaterialsAdded(newArray);
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
      newArray[index].maxQuantity = 0;
      setRawMaterialsAdded(newArray);
      return;
    }

    if (value === '' || value === undefined || value === null) {
      newArray[index].stillRemains = Number(newArray[index].maxQuantity);
      Number(newArray[index].maxQuantity) - Number(value);
      newArray[index].quantity = value.replaceAll(',', '.');
      setRawMaterialsAdded(newArray);
      return;
    }

    newArray[index].stillRemains =
      Number(newArray[index].maxQuantity) - Number(value);
    newArray[index].quantity = value.replaceAll(',', '.');

    setRawMaterialsAdded(newArray);
  }

  function handleChangeCargo(value, index) {
    let newArray = [...rawMaterialsAdded];

    const cargoFind = cargo.find((cargoFind) => cargoFind.id === value);

    const cargoName = cargoFind.cargo;

    if (cargoName === 'Genérico') {
      newArray[index].maxQuantity = cargoFind.quantity;
      newArray[index].cargo = '';
      setRawMaterialsAdded(newArray);
    }

    newArray[index].maxQuantity = cargoFind.quantity;
    newArray[index].cargo = cargoFind.cargo;
    setRawMaterialsAdded(newArray);
  }

  async function handleClickCargo(value, index) {
    let newArray = [...rawMaterialsAdded];

    const response = await api.get(`/warehouse/stock`, {
      params: {
        position_id: newArray[index].position_id,
        raw_material_id: newArray[index].raw_material_id,
      },
    });

    setCargo(response.data);
    setRawMaterialsAdded(newArray);
  }

  function handleEdit(data) {
    setId(data.id);
    setDescription(data.description);

    setIsLockInsChange(true);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      const response = await api.delete(`/warehouse/exit/${id}`);

      const filterExits = exit.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setExits(filterExits);

      Notification({
        type: 'success',
        title: 'Deletado',
        description: 'Saída Exlcuída com sucesso',
      });
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível deletar a saída',
      });
    }
  }

  function setDataOfStockSearchedForAPI(data) {
    let newArray = [...rawMaterialsAdded];

    const lastItemOfArray = newArray.length - 1;

    newArray[lastItemOfArray].raw_material_id = data.raw_material_id;
    newArray[lastItemOfArray].warehouseName = data.warehouse_name;
    newArray[lastItemOfArray].position_id = data.position_id;
    newArray[lastItemOfArray].positionName = data.position_name;
    newArray[lastItemOfArray].maxQuantity = data.quantity;
    newArray[
      lastItemOfArray
    ].rawMaterialName = `${data.raw_material_code} | ${data.raw_material_name} / (${data.unit_of_measurement_abbreviation})`;
    newArray[lastItemOfArray].cargo = data.cargo;

    setRawMaterialsAdded(newArray);
  }

  async function findBarcodeOnStock(barcode) {
    const response = await api.get(`/warehouse/stock/barcode`, {
      params: {
        bar_code: barcode,
      },
    });

    if (!response.data) {
      Notification({
        type: 'error',
        title: 'Erro',
        description: `Código não encontrado`,
      });
      return;
    }

    setDataOfStockSearchedForAPI(response.data);
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
          width: '30%',
          // ...this.getColumnSearchProps('users_name'),
          // sorter: (a, b) => a.users_name.length - b.users_name.length,
        },
        {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '30%',
          // ...this.getColumnSearchProps('description'),
          // sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          // ...this.getColumnSearchProps('created_at'),
          // sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
        {
          title: 'Operação',
          key: 'operation',
          render: (record) => {
            return (
              <>
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => handleDelete(record.id)}
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
      return <Table columns={columns} dataSource={exits} />;
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
              Realizar Saída
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        width={800}
        title="Saída"
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
        <Row gutter={5}>
          <Col span={13}>
            <Form.Item
              key="storageCargoFormItem"
              labelCol={{ span: 23 }}
              label="Nome do PCP"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="storageCargo"
                size="large"
                placeholder="Digite o nome do pcp"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        {rawMaterialsAdded.map((selectedIten, index) => (
          <>
            <Row gutter={24}>
              <Col span={15}>
                <Form.Item
                  key="formItemRawMaterials"
                  labelCol={{ span: 23 }}
                  label="Insumo: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                  }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Selecion o insumo"
                    optionFilterProp="children"
                    value={selectedIten.rawMaterialName}
                    //disabled={isLockInsChange}
                    onChange={(e) => {
                      handleChangeRawMaterial(e, index);
                    }}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {rawMaterials.map((item) => (
                      <>
                        <Option
                          key={item.raw_material_id}
                          value={item.raw_material_id}
                        >
                          {`${item.raw_material_code} |
                          ${item.raw_material_name} / 
                          (${item.unit_of_measurement_abbreviation})`}
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
                    disabled={selectedIten.rawMaterialName != '' ? false : true}
                    value={selectedIten.warehouseName}
                    onClick={() => handleClickWarehouse(index)}
                    onChange={(e) => {
                      handleChangeWarehouse(e, index);
                    }}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {warehouses.map((item) => (
                      <>
                        <Option key={item.id} value={item.id}>
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
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {positions.map((item) => (
                      <>
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  key="CargoSelectItemRawMaterials"
                  labelCol={{ span: 23 }}
                  label="Lote: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    disabled={selectedIten.positionName !== '' ? false : true}
                    value={selectedIten.cargo}
                    onClick={(e) => handleClickCargo(e, index)}
                    onChange={(e) => {
                      handleChangeCargo(e, index);
                    }}
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {cargo.map((item) => (
                      <>
                        <Option key={item.id} value={item.id}>
                          {item.cargo === ''
                            ? (item.cargo = 'Genérico')
                            : item.cargo}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
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
                  labelCol={{ span: 20 }}
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
                      onClick={() => removeExit(index)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  key="formStillRemains"
                  labelCol={{ span: 23 }}
                  label="Ainda Resta: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                  }}
                  required
                >
                  <Input
                    type="number"
                    key="quantiyKey"
                    size="large"
                    value={selectedIten.stillRemains}
                    disabled={true}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            {rawMaterialsAdded.length - 1 === index && (
              <Button
                key="primary"
                title="Nova Saída"
                style={{
                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                disabled={selectedIten.quantity != '' ? false : true}
                onClick={addNewExit}
              >
                <PlusOutlined />
                Nova Saída
              </Button>
            )}
            {isModalOpen == true && (
              <BarcodeReader onScan={(e) => findBarcodeOnStock(e)} />
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
    const rawMaterialResponse = await apiClient.get(
      '/warehouse/stock/raw-materials'
    );
    const warehouseResponse = await apiClient.get('/warehouse/warehouse');
    const exitResponse = await apiClient.get('/warehouse/exit');

    const rawMaterialData = rawMaterialResponse.data;
    const exitData = exitResponse.data;
    const warehouseData = warehouseResponse.data;

    return {
      props: {
        rawMaterial: rawMaterialData,
        exit: exitData,
        warehouse: warehouseData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        rawMaterial: [],
        exit: [],
        warehouse: [],
      },
    };
  }
};
