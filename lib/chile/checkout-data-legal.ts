/** Referencias legales chilenas para la recolección de datos en checkout. */

export type ChileLawReference = {
  id: string;
  shortName: string;
  fullName: string;
  /** Enlace a texto oficial en Ley Chile (BCN). */
  href: string;
};

export const chilePersonalDataLaws: ChileLawReference[] = [
  {
    id: "19.628",
    shortName: "Ley N° 19.628",
    fullName:
      "Ley sobre protección de la vida privada (protección de datos personales)",
    href: "https://www.bcn.cl/leychile/navegar?idNorma=141599",
  },
  {
    id: "21.719",
    shortName: "Ley N° 21.719",
    fullName: "Ley de protección de datos personales",
    href: "https://www.bcn.cl/leychile/navegar?idNorma=1202842",
  },
];

export const chileTaxLawReference: ChileLawReference = {
  id: "codigo-tributario",
  shortName: "Código Tributario",
  fullName: "Obligaciones de documentación tributaria (SII)",
  href: "https://www.bcn.cl/leychile/navegar?idNorma=1002848",
};

export const siiElectronicDocumentsUrl =
  "https://www.sii.cl/normativa_legislacion/legislacion_tributaria.html";
