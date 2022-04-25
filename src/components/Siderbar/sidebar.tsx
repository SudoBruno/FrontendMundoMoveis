import {
  DashboardOutlined,
  FileExcelOutlined,
  PlusOutlined,
  RightSquareOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ExportOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { Button, Layout, Menu, Result } from 'antd';
import 'antd/dist/antd.css';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { FiPackage } from 'react-icons/fi';
import { Header } from '../Header';
import { useRouter } from 'next/router';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

interface SidebarProps {
  screen: ReactNode;
  display: boolean;
}

export default function Sidebar({ screen, display }: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {display ? (
        <Layout>
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            style={{ minHeight: '100vh' }}
          >
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="Dashboard" icon={<DashboardOutlined />}>
                <Link href="/Profile">Dashboard</Link>
              </Menu.Item>

              <SubMenu
                key="WnsInsumos"
                title="Almoxarifado"
                icon={
                  <span className="anticon anticon-bank">
                    <FiPackage size={16} color="#fff" />
                  </span>
                }
              >
                <SubMenu
                  key="WnsInsumosCadastros"
                  title="Cadastros"
                  icon={<PlusOutlined />}
                >
                  <Menu.Item key="Almoxarifado" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/warehouse">
                      Almoxarifado
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="Un.Medidas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/unityMeasure">
                      Un. Medidas
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="Categoria" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/categories">Categoria</Link>
                  </Menu.Item>

                  <Menu.Item key="Fornecedores" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/supplier">
                      Fornecedores
                    </Link>
                  </Menu.Item>

                  <Menu.Item key="Insumos" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/rawMaterial">Insumos</Link>
                  </Menu.Item>

                  <Menu.Item key="Posições" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/position">Posições</Link>
                  </Menu.Item>
                </SubMenu>

                <SubMenu
                  key="WnsInsumosOperacao"
                  title="Operações"
                  icon={<ShoppingCartOutlined />}
                >
                  <Menu.Item key="Entradas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Receivement">Entrada</Link>
                  </Menu.Item>

                  <Menu.Item key="Armazenagens" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Storage">Armazenagem</Link>
                  </Menu.Item>

                  <Menu.Item key="Saídas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Exit">Saída</Link>
                  </Menu.Item>

                  <Menu.Item
                    key="Alterar_Estoque"
                    icon={<RightSquareOutlined />}
                  >
                    <Link href="/Warehouse/Operation/AlterStock">
                      Alterar Estoque
                    </Link>
                  </Menu.Item>
                </SubMenu>

                <SubMenu
                  key="WnsInsumosSearches"
                  title="Consultas"
                  icon={<SearchOutlined />}
                >
                  <Menu.Item key="Estoque" icon={<FileExcelOutlined />}>
                    <Link href="/Warehouse/Consult/Stock">Estoque</Link>
                  </Menu.Item>

                  <Menu.Item key="relat-saida" icon={<FileExcelOutlined />}>
                    <Link href="/Warehouse/Consult/Exit">Rel. Saídas</Link>
                  </Menu.Item>
                  <Menu.Item key="Rel.entrada" icon={<FileExcelOutlined />}>
                    <Link href="/Warehouse/Consult/Receipt">Rel. entrada</Link>
                  </Menu.Item>
                </SubMenu>
              </SubMenu>
              <SubMenu
                key="ChronoanalysisMenu"
                title="Cronoanálise"
                icon={<FieldTimeOutlined />}
              >
                <SubMenu
                  key="FinancialRegister"
                  title="Cadastros"
                  icon={<PlusOutlined />}
                >
                  <Menu.Item
                    key="SubLineMenuItem"
                  >
                    <Link href="/Chronoanalysis/SubLine">Sub Linha</Link>
                  </Menu.Item>
                  <Menu.Item
                    key="WorkElementMenuItem"
                  >
                    <Link href="/Chronoanalysis/WorkElement">Elemento de Trabalho</Link>
                  </Menu.Item>
                  <Menu.Item
                    key="subProductProcessMenuItem"
                  >
                    <Link href="/Chronoanalysis/SubProductProcess">Sub-Produto de Processo</Link>
                  </Menu.Item>
                  <Menu.Item
                    key="ProductProcessMenuItem"
                  >
                    <Link href="/Chronoanalysis/ProcessProduct">Produto de Processo</Link>
                  </Menu.Item>
                </SubMenu>
                <Menu.Item key="Chronoanalysis" icon={<RightSquareOutlined />}>
                  <Link href="/Chronoanalysis/Chronoanalysis">Cronoanálise</Link>
                </Menu.Item>

              </SubMenu>

              {/* <SubMenu
                key="FinancialMenu"
                title="Financeiro"
                icon={<DollarCircleOutlined />}
              >
                <SubMenu
                  key="subFinancialRegister"
                  title="Cadastros"
                  icon={<PlusOutlined />}
                >
                  <Menu.Item
                    key="FinancialMenuItem"
                    icon={<FaRegMoneyBillAlt />}
                  >
                    <Link href="/Financial/AccountPlan/">Plano de Conta</Link>
                  </Menu.Item>
                  <Menu.Item
                    key="FinancialCostCenterMenuItem"
                    icon={<FaRegMoneyBillAlt />}
                  >
                    <Link href="/Financial/CostCenter/">Centro de custo</Link>
                  </Menu.Item>
                  <Menu.Item
                    key="SolicitationTypeMenuItem"
                    icon={<FaRegMoneyBillAlt />}
                  >
                    <Link href="/Financial/SolicitationType/">
                      Tipo de Solicitação
                    </Link>
                  </Menu.Item>
                  <Menu.Item
                    key="PaymentTypeMenuItem"
                    icon={<FaRegMoneyBillAlt />}
                  >
                    <Link href="/Financial/PaymentType/">
                      Tipo de Pagamento
                    </Link>
                  </Menu.Item>
                </SubMenu>

                <Menu.Item
                  key="SolicitationMenuItem"
                  icon={<ProfileOutlined />}
                >
                  <Link href="/Financial/Solicitation/">Solicitação</Link>
                </Menu.Item>
                <Menu.Item key="approvatMenuItem" icon={<ProfileOutlined />}>
                  <Link href="/Financial/Approve/">Aprovação</Link>
                </Menu.Item>
              </SubMenu> */}

              <Menu.Item key="Exit" icon={<ExportOutlined />}>
                <Link href="/">Sair</Link>
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout>
            {router.pathname !== '/Warehouse/Consult/Stock/[barcode]' && (
              <Header />
            )}
            {screen && (
              <Content style={{ margin: '20px 16px 0' }}>
                <div>{screen}</div>
              </Content>
            )}
            {!screen && (
              <Content style={{ margin: '20px 16px 0' }}>
                <Result
                  status="500"
                  title="500"
                  subTitle="Sorry, something went wrong."
                  extra={<Button type="primary">Back Home</Button>}
                />
              </Content>
            )}
          </Layout>
        </Layout>
      ) : (
        <>{screen}</>
      )}
    </>
  );
}
