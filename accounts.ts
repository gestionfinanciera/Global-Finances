
import { Account, AccountType } from './types';

export const CHART_OF_ACCOUNTS: Account[] = [
  // --- 1. ACTIVO CIRCULANTE ---
  { id: 'acc_cash', name: 'Caja', type: AccountType.ASSET, description: 'Dinero en billetes y monedas físicamente en las instalaciones. Ejemplo: $800.000 en la caja fuerte.' },
  { id: 'acc_petty_cash', name: 'Caja Chica', type: AccountType.ASSET, description: 'Fondo fijo para gastos pequeños y cotidianos. Ejemplo: Fondo de $50.000 para insumos.' },
  { id: 'acc_bank', name: 'Bancos', type: AccountType.ASSET, description: 'Dinero depositado en cuentas corrientes o de ahorro. Ejemplo: Cuenta en Banco Nación.' },
  { id: 'acc_values', name: 'Valores de Cambio', type: AccountType.ASSET, description: 'Cheques recibidos de terceros aún no depositados o cobrados.' },
  { id: 'acc_fixed_dep', name: 'Plazo Fijo', type: AccountType.ASSET, description: 'Depósitos bancarios a plazo menor a un año que generan interés.' },
  { id: 'acc_receivable', name: 'Clientes', type: AccountType.ASSET, description: 'Dinero que deben los clientes por ventas realizadas a crédito sin documento formal.' },
  { id: 'acc_notes_rec', name: 'Documentos por Cobrar', type: AccountType.ASSET, description: 'Títulos formales como pagarés que garantizan un cobro futuro.' },
  { id: 'acc_vat_credit', name: 'Crédito Fiscal IVA', type: AccountType.ASSET, description: 'IVA pagado en compras, compensable con el IVA de ventas.' },
  { id: 'acc_inventory', name: 'Mercaderías', type: AccountType.ASSET, description: 'Productos comprados para reventa sin modificación.' },
  { id: 'acc_raw_materials', name: 'Materia Prima', type: AccountType.ASSET, description: 'Insumos destinados a la fabricación de productos.' },

  // --- 2. ACTIVO NO CIRCULANTE ---
  { id: 'acc_land', name: 'Terrenos', type: AccountType.ASSET, description: 'Lotes o predios propios. No se deprecian.' },
  { id: 'acc_buildings', name: 'Edificios y Construcciones', type: AccountType.ASSET, description: 'Galpones o oficinas propias.' },
  { id: 'acc_machinery', name: 'Maquinaria y Equipo', type: AccountType.ASSET, description: 'Máquinas industriales pesadas.' },
  { id: 'acc_vehicles', name: 'Vehículos', type: AccountType.ASSET, description: 'Flota de transporte de la empresa.' },
  { id: 'acc_furniture', name: 'Mobiliario y Útiles', type: AccountType.ASSET, description: 'Escritorios, sillas y estanterías.' },
  { id: 'acc_it_equip', name: 'Equipos de Computación', type: AccountType.ASSET, description: 'PCs, servidores e impresoras.' },
  { id: 'acc_trademarks', name: 'Marcas Comerciales', type: AccountType.ASSET, description: 'Derechos sobre nombres y logos registrados.' },

  // --- 3. PASIVO CIRCULANTE ---
  { id: 'acc_suppliers', name: 'Proveedores', type: AccountType.LIABILITY, description: 'Dinero adeudado por compras de mercadería a crédito.' },
  { id: 'acc_notes_pay', name: 'Documentos por Pagar', type: AccountType.LIABILITY, description: 'Títulos formales como pagarés firmados por la empresa.' },
  { id: 'acc_st_bank_loans', name: 'Préstamos Bancarios (CP)', type: AccountType.LIABILITY, description: 'Financiamiento bancario a devolver en menos de un año.' },
  { id: 'acc_vat_payable', name: 'IVA por Pagar', type: AccountType.LIABILITY, description: 'IVA cobrado en ventas pendiente de transferir.' },
  { id: 'acc_salaries_payable', name: 'Sueldos por Pagar', type: AccountType.LIABILITY, description: 'Remuneraciones devengadas pendientes de abono.' },

  // --- 4. PASIVO NO CIRCULANTE ---
  { id: 'acc_lt_bank_loans', name: 'Préstamos Bancarios (LP)', type: AccountType.LIABILITY, description: 'Financiamiento bancario con vencimiento superior a un año.' },
  { id: 'acc_mortgages', name: 'Hipotecas por Pagar', type: AccountType.LIABILITY, description: 'Préstamos garantizados con inmuebles de la empresa.' },

  // --- 5. PATRIMONIO NETO ---
  { id: 'acc_cap_subscribed', name: 'Capital Suscrito', type: AccountType.EQUITY, description: 'Capital total que los socios se comprometieron a aportar.' },
  { id: 'acc_cap_paid', name: 'Capital Integrado (Pagado)', type: AccountType.EQUITY, description: 'Parte del capital suscrito que los socios ya aportaron efectivamente.' },
  { id: 'acc_res_legal', name: 'Reserva Legal', type: AccountType.EQUITY, description: 'Reserva obligatoria por ley (acumulación de utilidades).' },
  { id: 'acc_ret_earnings', name: 'Utilidades No Distribuidas', type: AccountType.EQUITY, description: 'Ganancias de ejercicios pasados que no se repartieron ni reservaron.' },
  { id: 'acc_period_result', name: 'Resultado del Ejercicio Actual', type: AccountType.EQUITY, description: 'Ganancia o pérdida neta del período vigente.' },

  // --- 6. RESULTADO POSITIVO (Ingresos) ---
  { id: 'acc_sales_merch', name: 'Ventas de Mercaderías', type: AccountType.INCOME, description: 'Ingreso por la venta de productos comprados para revender.' },
  { id: 'acc_sales_prod', name: 'Ventas de Productos Fabricados', type: AccountType.INCOME, description: 'Ingreso por la venta de bienes fabricados por la empresa.' },
  { id: 'acc_serv_main', name: 'Ingresos por Servicios', type: AccountType.INCOME, description: 'Actividad central de prestación de servicios.' },
  { id: 'acc_fin_int_earned', name: 'Intereses Ganados', type: AccountType.INCOME, description: 'Intereses por inversiones o préstamos otorgados.' },
  { id: 'acc_fin_exch_gain', name: 'Ganancia por Tipo de Cambio', type: AccountType.INCOME, description: 'Resultado positivo por revalorización de moneda extranjera.' },

  // --- 7. RESULTADO NEGATIVO (Gastos y Pérdidas) ---
  
  // 7.1 Costos de Ventas
  { id: 'acc_cogs', name: 'Costo de Mercadería Vendida (CMV)', type: AccountType.EXPENSE, description: 'Costo de adquisición de los productos que se vendieron en el período.' },
  { id: 'acc_cost_prod_sold', name: 'Costo de Productos Fabricados Vendidos', type: AccountType.EXPENSE, description: 'Costo de fabricación (MP + Mano de Obra) de los bienes vendidos.' },
  { id: 'acc_raw_mat_consumed', name: 'Materia Prima Consumida', type: AccountType.EXPENSE, description: 'Costo de los insumos usados en la producción del período.' },
  { id: 'acc_direct_labor', name: 'Mano de Obra Directa', type: AccountType.EXPENSE, description: 'Costo de los operarios que trabajan directamente en la fabricación.' },
  
  // 7.2 Gastos de Ventas
  { id: 'acc_exp_adv', name: 'Gastos de Publicidad y Marketing', type: AccountType.EXPENSE, description: 'Inversión en redes sociales, TV, Google Ads o folletería.' },
  { id: 'acc_exp_distrib', name: 'Gastos de Distribución y Fletes', type: AccountType.EXPENSE, description: 'Costo de llevar los productos desde la empresa hasta los clientes.' },
  { id: 'acc_exp_commissions', name: 'Comisiones por Ventas', type: AccountType.EXPENSE, description: 'Pagos porcentuales a vendedores o agentes por ventas concretadas.' },
  { id: 'acc_exp_sales_discounts', name: 'Descuentos por Ventas', type: AccountType.EXPENSE, description: 'Reducciones de precio otorgadas a clientes (ej: pronto pago).' },
  
  // 7.3 Gastos de Administración
  { id: 'acc_salaries_exp', name: 'Sueldos y Salarios', type: AccountType.EXPENSE, description: 'Remuneraciones del personal administrativo y gerencial.' },
  { id: 'acc_employer_contributions', name: 'Contribuciones Patronales', type: AccountType.EXPENSE, description: 'Aportes obligatorios al Estado por cada empleado (Jubilación, Obra Social).' },
  { id: 'acc_rent_exp', name: 'Alquiler de Oficinas', type: AccountType.EXPENSE, description: 'Costo del arrendamiento de los locales administrativos.' },
  { id: 'acc_utilities_electricity', name: 'Gasto Energía Eléctrica', type: AccountType.EXPENSE, description: 'Factura de luz de las instalaciones.' },
  { id: 'acc_utilities_comms', name: 'Gastos de Comunicaciones', type: AccountType.EXPENSE, description: 'Teléfono, internet y planes de datos empresariales.' },
  { id: 'acc_office_supplies', name: 'Papelería y Útiles', type: AccountType.EXPENSE, description: 'Hojas, carpetas, bolígrafos e insumos menores de oficina.' },
  { id: 'acc_professional_fees', name: 'Honorarios Profesionales', type: AccountType.EXPENSE, description: 'Pagos a contadores, abogados o consultores externos.' },
  { id: 'acc_insurance_exp', name: 'Gastos de Seguros', type: AccountType.EXPENSE, description: 'Primas de seguro de bienes o responsabilidad civil.' },
  
  // 7.4 Gastos Financieros
  { id: 'acc_fin_int_paid', name: 'Intereses Pagados', type: AccountType.EXPENSE, description: 'Costo por el uso de capital ajeno (préstamos, sobregiros).' },
  { id: 'acc_fin_exch_loss', name: 'Pérdida por Tipo de Cambio', type: AccountType.EXPENSE, description: 'Resultado negativo por devaluación ante deudas en moneda extranjera.' },
  { id: 'acc_bank_fees', name: 'Gastos y Comisiones Bancarias', type: AccountType.EXPENSE, description: 'Cargos por mantenimiento de cuenta y movimientos bancarios.' },
  
  // 7.5 Depreciaciones y Amortizaciones
  { id: 'acc_dep_exp_ppe', name: 'Depreciación de Bienes de Uso', type: AccountType.EXPENSE, description: 'Gasto por el desgaste periódico de máquinas, vehículos y edificios.' },
  { id: 'acc_amort_exp_intang', name: 'Amortización de Intangibles', type: AccountType.EXPENSE, description: 'Gasto por el consumo periódico de marcas, software o patentes.' },
  
  // 7.6 Pérdidas
  { id: 'acc_loss_bad_debt', name: 'Pérdidas por Incobrabilidad', type: AccountType.EXPENSE, description: 'Clientes que no pagarán su deuda y se da por perdida.' },
  { id: 'acc_loss_sale_assets', name: 'Pérdida por Venta de Activos', type: AccountType.EXPENSE, description: 'Venta de un bien de uso por un precio menor a su valor en libros.' },
  { id: 'acc_loss_inventory_dmg', name: 'Deterioro de Inventarios', type: AccountType.EXPENSE, description: 'Mercaderías que se dañaron, vencieron o perdieron valor.' },
  { id: 'acc_loss_litigation', name: 'Pérdidas por Litigios y Multas', type: AccountType.EXPENSE, description: 'Indemnizaciones por juicios perdidos o sanciones estatales.' },
  { id: 'acc_loss_misc', name: 'Otras Pérdidas', type: AccountType.EXPENSE, description: 'Cualquier otro resultado negativo extraordinario.' },
];
