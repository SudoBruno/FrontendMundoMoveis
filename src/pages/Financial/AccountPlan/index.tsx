import {
  DeleteOutlined,
  EditFilled,
  QuestionCircleOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons/lib/icons/';

import {
  Button,
  Col,
  Form,
  Input,
  Select,
  Modal,
  Row,
  Popover,
  Table,
  Popconfirm,
  Space,
  Layout,
} from 'antd';
import { GetServerSideProps } from 'next';
import React, { FormEvent, useState } from 'react';
import { Notification } from '../../../components/Notification';
import { getAPIClient } from '../../../services/axios';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { api } from '../../../services/api';

const { Option } = Select;

interface IUser {
  id: string;
  name: string;
}

interface IAccountPlan {
  id: string;
  name: string;
  goal_limit_in_percent: number;
  purchase_limit: number;
  finance_goal: number;
  director_id: string;
  competent_authority_id: string;
  manager_id: string;
  competent_authority_name: string;
}

interface IProp {
  users: IUser[];
  accountPlans: IAccountPlan[];
}

export default function AccountPlan({ users, accountPlans }: IProp) {
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountPlan, setAccountPlan] = useState<IAccountPlan[]>(accountPlans);
  const [accountPlanId, setAccountPlanId] = useState<string>('');
  const [user, setUser] = useState<IUser[]>(users);
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [competentAuthorityId, setCompetentAuthorityId] = useState<string>('');
  const [competentAuthorityName, setCompetentAuthorityName] =
    useState<string>('');
  const [directorId, setDirectorId] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('');
  const [financeGoal, setFinancialGoal] = useState<number>(0);
  const [purchaseLimit, setPurchaseLimit] = useState<number>(0);
  const [goalLimitInPercent, setGoalLimitInPercent] = useState<number>(0);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    const data = {
      name: name,
      manager_id: managerId,
      competent_authority_id: competentAuthorityId,
      finance_goal: financeGoal,
      purchase_limit: purchaseLimit,
      director_id: directorId,
      goal_limit_in_percent: goalLimitInPercent,
    };

    if (accountPlanId) {
      try {
        setLoading(true);
        const response = await api.put(
          `/financial/account-plan/${accountPlanId}`,
          data
        );

        const filteredAccountPlan = accountPlan.filter((iten) => {
          if (iten.id !== accountPlanId) {
            return iten;
          }
        });

        filteredAccountPlan.push(response.data);

        setAccountPlan(filteredAccountPlan);

        setLoading(false);
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Conta editada com sucesso',
        });
        handleClose();
      } catch (error) {
        setLoading(false);
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: `${error.response.data.message}`,
        });
      }
    } else {
      try {
        setLoading(true);
        const response = await api.post('/financial/account-plan', data);

        setLoading(false);
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Conta criada com sucesso',
        });
        const newAccountPlanRegistered = response.data;
        accountPlan.push(newAccountPlanRegistered);

        handleClose();
      } catch (error) {
        setLoading(false);
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: `${error.response.data.message}`,
        });
      }
    }
  }

  async function handleEdit(id: string) {
    const searchedAccount = accountPlan.find((account) => account.id === id);
    setAccountPlanId(id);
    setIsModalOpen(true);
    setName(searchedAccount.name);
    setPurchaseLimit(searchedAccount.purchase_limit);
    setFinancialGoal(searchedAccount.finance_goal);
    setGoalLimitInPercent(searchedAccount.goal_limit_in_percent);
    setManagerId(searchedAccount.manager_id);
    setCompetentAuthorityId(searchedAccount.competent_authority_id);
    setDirectorId(searchedAccount.director_id);
  }

  async function handleDelete(id: string) {
    try {
      const response = await api.delete(`/${id}`);

      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Conta deletada com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: `${error.response}`,
      });
    }
  }

  function handleClose() {
    setLoading(false);
    setAccountPlanId('');
    setIsModalOpen(false);
    setManagerId('');
    setManagerName('');
    setCompetentAuthorityId('');
    setCompetentAuthorityName('');
    setDirectorId('');
    setDirectorName('');
    setFinancialGoal(0);
    setPurchaseLimit(0);
    setGoalLimitInPercent(0);
  }

  const popOverPurchaseLimitContent = (
    <>
      {' '}
      <p>
        O limite de compra é a quantidade estipulada de uma compra,
        <br />
        que quando excedido, o gestor responsável deve ser acionado
        <br />
        para a efetuar a autorização da mesma.
      </p>
    </>
  );

  const popOverGoalLimitContent = (
    <>
      {' '}
      <p>
        O limite da meta é a quantidade máxima
        <br /> em porcentagem {`(%)`} da meta de Financeira,
        <br />
        que quando excedido {`(ex: 85% do total)`} <br />
        o diretorresponsável deve ser acionado
        <br />
        para a efetuar a autorização de comprar excedentes.
      </p>
    </>
  );

  const popOverFinancialGoalContent = (
    <>
      {' '}
      <p>
        A Meta financeira é o valor total
        <br /> em reais {`(R$)`} estipulado para a conta.
      </p>
    </>
  );

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
          title: 'Nome da Conta',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
        },
        {
          title: 'Limite por compra',
          dataIndex: 'purchase_limit',
          key: 'purchase_limit',
          width: '20%',
          ...this.getColumnSearchProps('purchase_limit'),
          sorter: (a, b) => a.purchase_limit.length - b.purchase_limit.length,
        },
        {
          title: 'Meta Financeira',
          dataIndex: 'finance_goal',
          key: 'finance_goal',
          width: '20%',
          ...this.getColumnSearchProps('finance_goal'),
          sorter: (a, b) => a.finance_goal.length - b.finance_goal.length,
        },
        {
          title: 'Limite da meta (%)',
          dataIndex: 'purchase_limit',
          key: 'purchase_limit',
          width: '20%',
          ...this.getColumnSearchProps('purchase_limit'),
          sorter: (a, b) => a.purchase_limit.length - b.purchase_limit.length,
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
                  onClick={() => handleEdit(record.id)}
                />
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
      return <Table columns={columns} dataSource={accountPlan} />;
    }
  }

  return (
    <>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Conta
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de Plano de Conta"
        width={1100}
        visible={isOpenModal}
        onCancel={() => {
          handleClose();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              handleClose();
            }}
            type="default"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            loading={loading}
            type="primary"
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Row gutter={5}>
          <Col span={7}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 20 }}
              label="Nome da Conta:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                key="nameKey"
                size="large"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={7}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 20 }}
              label="Limite de Compra (R$):"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                type="number"
                key="quantiyKey"
                size="large"
                style={{ width: '80%', marginRight: '2%' }}
                value={String(purchaseLimit)}
                onChange={(e) => {
                  setPurchaseLimit(Number(e.target.value));
                }}
              />
              <Popover
                content={popOverPurchaseLimitContent}
                title="O que é o limite de compra ?"
              >
                <QuestionCircleOutlined
                  style={{ fontSize: '20px', cursor: 'pointer' }}
                />
              </Popover>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              key="goalLimitFormItem"
              labelCol={{ span: 20 }}
              label="Meta Financeira da Conta (R$):"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                type="number"
                key="quantiyKey"
                size="large"
                style={{ width: '80%', marginRight: '2%' }}
                value={String(financeGoal)}
                onChange={(e) => {
                  setFinancialGoal(Number(e.target.value));
                }}
              />
              <Popover
                content={popOverFinancialGoalContent}
                title="O que é a meta Financeira ?"
              >
                <QuestionCircleOutlined
                  style={{ fontSize: '20px', cursor: 'pointer' }}
                />
              </Popover>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              key="goalLimitFormItem"
              labelCol={{ span: 20 }}
              label="Limite da meta (%):"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                type="number"
                key="quantiyKey"
                size="large"
                value={String(goalLimitInPercent)}
                style={{ width: '80%', marginRight: '2%' }}
                onChange={(e) => {
                  setGoalLimitInPercent(Number(e.target.value));
                }}
              />
              <Popover
                content={popOverGoalLimitContent}
                title="O que é o limite de meta ?"
              >
                <QuestionCircleOutlined
                  style={{ fontSize: '20px', cursor: 'pointer' }}
                />
              </Popover>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={7}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 23 }}
              label="Nome do Gerente:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="managerName"
                size="large"
                placeholder="Selecione o Gerente da Conta"
                value={managerId}
                onChange={(e) => {
                  setManagerId(e.toString());
                }}
              >
                {user.map((item) => (
                  <>
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              key="competentAuthorityNameFormItem"
              labelCol={{ span: 23 }}
              label="Autoridade Competente:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="competentAuthorityNameSelect"
                size="large"
                value={competentAuthorityId}
                onChange={(e) => {
                  setCompetentAuthorityId(e.toString());
                }}
              >
                {user.map((item) => (
                  <>
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              key="directorFormItem"
              labelCol={{ span: 23 }}
              label="Diretor:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="dirctorName"
                size="large"
                value={directorId}
                onChange={(e) => {
                  setDirectorId(e.toString());
                }}
              >
                {user.map((item) => (
                  <>
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/users');
    const accountPlansResponse = await apiClient.get('financial/account-plan');

    return {
      props: {
        users: data,
        accountPlans: accountPlansResponse.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        users: [],
      },
    };
  }
};
