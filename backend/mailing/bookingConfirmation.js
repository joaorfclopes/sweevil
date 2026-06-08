export const bookingConfirmation = ({ booking, hasInvoice = false }) => {
  const dateStr = new Date(booking.date).toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const brand = process.env.BRAND_NAME || 'Sweevil';
  const homeUrl = process.env.VITE_HOME_PAGE || '';
  const contactEmail = process.env.VITE_SENDER_EMAIL_ADDRESS || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Marcação Confirmada</title>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,sans-serif;">
  <table width="600" border="0" cellpadding="0" cellspacing="0" align="center"
    style="background:#ffffff;margin:0 auto;border-radius:4px;overflow:hidden;">
    <tbody>
      <tr>
        <td style="background:#1a1a1a;padding:24px;text-align:center;">
          <a href="${homeUrl}" style="text-decoration:none;">
            ${
              process.env.BRAND_LOGO
                ? `<img src="${process.env.BRAND_LOGO}" alt="${brand}" width="150" style="display:block;margin:0 auto;" />`
                : `<span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px;">${brand}</span>`
            }
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 24px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Marcação Confirmada!</h1>
          <p style="margin:0 0 24px;color:#555;font-size:15px;">
            Olá ${booking.guestInfo.name}, a sua marcação foi confirmada e o pagamento recebido.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f9f9f9;border-radius:4px;padding:20px;">
            <tbody>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Data</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${dateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Hora</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.slot}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Valor Pago</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.price.toFixed(2)}€</span>
                </td>
              </tr>
              ${
                booking.vatNif
                  ? `<tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">NIF / IVA</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.vatNif}</span>
                </td>
              </tr>`
                  : ''
              }
            </tbody>
          </table>
          ${
            booking.images && booking.images.length > 0
              ? `
          <div style="margin-top:24px;">
            <p style="margin:0 0 10px;color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:bold;">As Suas Fotos</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody>
              ${(() => {
                const rows = [];
                for (let i = 0; i < booking.images.length; i += 3)
                  rows.push(booking.images.slice(i, i + 3));
                return rows
                  .map(
                    (row) =>
                      `<tr>${row.map((url) => `<td style="padding:4px;width:33.33%;vertical-align:top;"><a href="${url}" target="_blank" style="display:block;height:120px;overflow:hidden;border-radius:4px;border:1px solid #e0e0e0;"><img src="${url}" width="100%" height="120" style="display:block;width:100%;height:120px;object-fit:cover;" /></a></td>`).join('')}${
                        row.length < 3
                          ? Array(3 - row.length)
                              .fill('<td style="padding:4px;"></td>')
                              .join('')
                          : ''
                      }</tr>`
                  )
                  .join('');
              })()}
            </tbody></table>
          </div>`
              : ''
          }
          <p style="margin:20px 0 0;color:#767676;font-size:13px;font-style:italic;">
            Tenha em atenção que o valor da marcação não é reembolsável.
          </p>
          ${
            hasInvoice
              ? `
          <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
            A sua fatura está anexada a este e-mail em PDF.
          </p>`
              : ''
          }
          <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
            Se tiver alguma dúvida, por favor contacte-nos através de
            <a href="mailto:${contactEmail}" style="color:#1a1a1a;">${contactEmail}</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border-top:1px solid #e0e0e0;padding-top:32px;margin-top:8px;">
            <tbody>
              <tr>
                <td>
                  <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a1a;">Marcação de Tatuagem &amp; Políticas</h2>
                  <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.7;">
                    Cada design é uma peça original, desenhada à medida com autenticidade. Para garantir exclusividade, não repito designs. Se tiver interesse numa peça anterior, pode enviá-la como referência e eu criarei um novo design único inspirado nela.
                  </p>
                  <p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;font-weight:bold;">Informações Importantes sobre a Marcação:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                      ${[
                        [
                          'Depósito',
                          'A sua marcação só é confirmada após o pagamento do depósito. Este valor será deduzido do custo final da tatuagem.',
                        ],
                        [
                          'Cancelamentos',
                          'Os depósitos não são reembolsáveis em caso de cancelamento.',
                        ],
                        [
                          'Reagendamento',
                          'Para manter o seu depósito, por favor avise com pelo menos 3 dias de antecedência para qualquer necessidade de reagendamento.',
                        ],
                        [
                          'Pontualidade',
                          'Por favor seja pontual. Existe uma tolerância de 20 minutos. Após este tempo, a sessão será automaticamente cancelada e o depósito será perdido.',
                        ],
                        [
                          'Acompanhantes',
                          'É permitido um máximo de um acompanhante. Não é permitida a entrada de menores de 18 anos no estúdio.',
                        ],
                        [
                          'Preparação',
                          'Chegue bem alimentado e hidratado. O consumo de álcool ou outras substâncias nas 24 horas anteriores à sua sessão é estritamente proibido. Uma boa noite de sono é essencial.',
                        ],
                        [
                          'Roupa',
                          'Use roupa confortável que permita fácil acesso à área a tatuar e que não se importe de eventualmente manchar com tinta.',
                        ],
                        [
                          'Saúde',
                          'Por favor contacte-nos para reagendar se tiver febre, sintomas de gripe, ou se a pele na área a tatuar estiver queimada pelo sol ou irritada.',
                        ],
                      ]
                        .map(
                          ([label, text]) => `
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;width:110px;">
                          <strong style="color:#1a1a1a;font-size:13px;">${label}:</strong>
                        </td>
                        <td style="padding:6px 0;color:#555;font-size:13px;line-height:1.6;">${text}</td>
                      </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                  <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">Esperamos vê-lo(a) em breve!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#1a1a1a;padding:20px;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} ${brand}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};
