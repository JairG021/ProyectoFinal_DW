export default class Habitacion {
  constructor({ codigo, numero, tipo, valor }) {
    this.codigo = codigo;
    this.numero = numero;
    this.tipo = tipo;
    this.valor = valor === undefined ? undefined : Number(valor);
  }

  static fromRow(row) {
    return new Habitacion(row);
  }

  toDatabaseValues() {
    return Object.fromEntries(
      Object.entries({
        numero: this.numero,
        tipo: this.tipo,
        valor: this.valor,
      }).filter(([, value]) => value !== undefined),
    );
  }
}
