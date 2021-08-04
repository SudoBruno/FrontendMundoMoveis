import { GetServerSideProps } from 'next';
import styles from '../../../../styles/warehouse/tag.module.scss';
import BarCode from 'react-barcode';
import { api } from '../../../../services/api';
import { getAPIClient } from '../../../../services/axios';

interface IStock {
  id: string;
  quantity: string;
  position_name: string;
  raw_material_name: string;
  raw_material_code: string;
  unit_of_measurement_name: string;
  bar_code: string;
  warehouse_name: string;
  user_name: string;
}

interface ITagProps {
  stock: IStock;
}

export default function WarehouseTag({ stock }: ITagProps) {
  return (
    <>
      <div className={styles.tag}>
        <div className={styles.header}>
          <img width={180} height={60} src="/logo.png"></img>
        </div>
        <hr />
        <div className={styles.body}>
          <b>Almoxarifado</b>
          <b>Posição</b>

          <p>{stock.warehouse_name}</p>
          <p>{stock.position_name}</p>

          <b>Insumo</b>
          <b>Quantidade</b>

          <p>{stock.raw_material_name}</p>
          <p>{stock.quantity}</p>
        </div>
        <h3 className={styles.insCode}> {stock.raw_material_code}</h3>
        <hr />

        <div className={styles.operations}>
          <b>QTD. ATUAL</b>
          <b>QTD. SAIDA</b>
          <b>RESULTADO</b>
          <p>___________ -</p>
          <p>___________ =</p>
          <p>___________</p>
          <p>___________ -</p>
          <p>___________ =</p>
          <p>___________</p>
          <p>___________ -</p>
          <p>___________ =</p>
          <p>___________</p>
          <p>___________ -</p>
          <p>___________ =</p>
          <p>___________</p>
        </div>

        <hr />

        <div className={styles.barcode}>
          <BarCode
            value={stock.bar_code}
            width={1.2}
            height={40}
            fontSize={20}
          />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { barcode } = context.params;
  const { data } = await apiClient.get('warehouse/stock/barcode', {
    params: {
      bar_code: barcode,
    },
  });

  return {
    props: {
      stock: data,
    },
  };
};
