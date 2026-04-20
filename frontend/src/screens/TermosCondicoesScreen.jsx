import React from "react";

export default function TermosCondicoesScreen() {
  return (
    <section className="legal-screen custom-font">
      <h1>Termos e Condições Gerais de Venda</h1>
      <span className="last-updated">Última atualização: 8 de abril de 2026</span>

      <h2>1. Identificação do Vendedor</h2>
      <p>
        Sílvia Seixas Pinho Peralta, a exercer atividade sob a marca Sweevil,
        com NIF 247 911 780, com sede em Rua das Eirinhas, 157, Casa 6,
        4300-166 Porto, Portugal.
      </p>
      <p>
        Contacto: <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a> | +351 916 828 734
      </p>

      <h2>2. Âmbito de Aplicação</h2>
      <p>
        Os presentes Termos e Condições regem todas as compras realizadas na
        loja online Sweevil (sweevil.pt). Ao concluir uma encomenda, o cliente
        aceita integralmente estes termos.
      </p>

      <h2>3. Produtos e Preços</h2>
      <p>
        Todos os preços indicados incluem IVA à taxa legal em vigor. A Sweevil
        reserva-se o direito de alterar os preços sem aviso prévio, sendo
        aplicável o preço vigente no momento da encomenda. As imagens dos
        produtos são meramente ilustrativas e podem diferir ligeiramente dos
        artigos reais.
      </p>

      <h2>4. Métodos de Pagamento</h2>
      <p>São aceites os seguintes métodos de pagamento:</p>
      <ul>
        <li>Cartão de crédito/débito (Stripe)</li>
        <li>Cartão de débito</li>
        <li>MB Way</li>
        <li>Revolut</li>
      </ul>
      <p>
        O pagamento é processado no momento da encomenda. Caso o pagamento não
        seja confirmado, a encomenda será cancelada automaticamente.
      </p>

      <h2>5. Envio e Entrega</h2>
      <p>
        Os envios são realizados para toda a Europa através das transportadoras
        CTT, DPD, DHL e GLS. O prazo estimado de entrega é de 5 dias úteis
        após confirmação do pagamento, podendo variar em função do destino e
        da transportadora selecionada.
      </p>
      <p>
        Os custos de envio são calculados no momento do checkout com base no
        destino e peso da encomenda.
      </p>

      <h2>6. Direito de Arrependimento</h2>
      <p>
        O cliente dispõe de 14 dias de calendário, a contar da data de receção
        do artigo, para exercer o direito de livre resolução do contrato, sem
        necessidade de apresentar qualquer justificação. Para mais informações,
        consulte a nossa{" "}
        <a href="/direito-de-arrependimento">Política de Direito de Arrependimento</a>.
      </p>

      <h2>7. Devoluções e Reembolsos</h2>
      <p>
        Os artigos devolvidos devem encontrar-se em perfeito estado, sem
        utilização e na embalagem original. Os custos de devolução são
        suportados pelo cliente. O reembolso é efetuado através do mesmo método
        de pagamento utilizado na compra, no prazo máximo de 14 dias após
        receção do artigo devolvido. Para mais detalhes, consulte a nossa{" "}
        <a href="/politica-de-devolucoes">Política de Devoluções e Reembolsos</a>.
      </p>

      <h2>8. Resolução de Litígios</h2>
      <p>
        Em caso de litígio, o consumidor pode recorrer a uma entidade de
        Resolução Alternativa de Litígios (RAL). A plataforma europeia de
        resolução de litígios em linha está disponível em{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>.
      </p>
      <p>
        Pode ainda apresentar reclamação através do Livro de Reclamações
        Eletrónico em{" "}
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">
          www.livroreclamacoes.pt
        </a>.
      </p>

      <h2>9. Lei Aplicável</h2>
      <p>
        Os presentes Termos e Condições são regidos pela lei portuguesa. Para
        quaisquer litígios emergentes da relação contratual, é competente o
        tribunal da comarca do Porto, sem prejuízo do disposto na legislação
        de defesa do consumidor.
      </p>
    </section>
  );
}
