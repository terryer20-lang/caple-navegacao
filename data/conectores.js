// data/conectores.js — Conectores discursivos A1-C2 (PT-PT)
// Total: 119+ conectores e locuções
const CONECTORES_DATA = [
  {
    categoria: 'Concessão',
    desc: 'Contraste ou oposição parcial',
    items: [
      {
        pt: 'Embora',
        zh: '雖然、儘管',
        exs: [
          'Embora chovesse intensamente, a manifestação seguiu conforme previsto.',
          'O relatório é exaustivo, embora lhe falte uma análise comparativa mais aprofundada.',
          'Embora tenha sido alertado várias vezes, optou por ignorar os avisos.',
          'A proposta foi aprovada, embora com um número significativo de abstenções.',
          'Embora a evidência seja circunstancial, o tribunal deu-lhe crédito.',
          'Manteve-se sereno, embora a pressão fosse quase insuportável.'
        ]
      },
      {
        pt: 'Ainda que',
        zh: '儘管、即使',
        exs: [
          'Ainda que os prazos sejam apertados, temos capacidade para cumprir o estipulado.',
          'Não desistiu do projeto, ainda que todos à sua volta o incentivassem a abandoná-lo.',
          'Ainda que o investimento inicial seja avultado, a recuperação do capital está garantida.',
          'O académico recusou-se a ceder, ainda que isso lhe custasse a reputação.',
          'Ainda que a solução pareça simples, a sua implementação revela-se complexa.',
          'Decidiram avançar, ainda que as condições climatéricas fossem adversas.'
        ]
      },
      {
        pt: 'Mesmo que',
        zh: '即使',
        exs: [
          'Não o perdoarei, mesmo que ele se arrependa sinceramente.',
          'Mesmo que o cenário se revele pior do que o antecipado, o plano mantém-se.',
          'A ponte será construída, mesmo que o orçamento tenha de ser revisto em alta.',
          'Mesmo que lhe oferecessem o cargo, duvido que aceitasse.',
          'O sistema funciona, mesmo que as condições de operação sejam extremas.',
          'Não desistiremos, mesmo que todos os indicadores sejam desfavoráveis.'
        ]
      },
      {
        pt: 'Apesar de',
        zh: '儘管 (+ inf./subst.)',
        exs: [
          'Apesar das críticas veementes, o autor manteve a sua posição intelectual.',
          'O espetáculo foi um sucesso, apesar de todos os contratempos logísticos.',
          'Apesar de estar exausto, decidiu terminar a redação do parecer.',
          'A empresa prosperou, apesar da conjuntura económica desfavorável.',
          'Apesar de lhe faltar experiência, revelou uma maturidade invulgar.',
          'O acordo foi celebrado, apesar das divergências ideológicas entre as partes.'
        ]
      },
      {
        pt: 'não obstante',
        zh: '儘管',
        exs: [
          'Não obstante as críticas construtivas, o gestor optou por manter a estratégia inicial.',
          'O orador insistiu no argumento, não obstante a plateia manifestar discordância.',
          'Não obstante a complexidade do tema, a exposição foi clara e acessível.',
          'A decisão foi unânime, não obstante as reservas manifestadas por alguns membros.',
          'Não obstante o avanço tecnológico, persistimos com métodos arcaicos.',
          'Manteve-se fiel aos seus princípios, não obstante as pressões externas.'
        ]
      },
      {
        pt: 'por mais que',
        zh: '無論多麼',
        exs: [
          'Por mais que se esforce, nunca consegue atingir os objetivos a que se propõe.',
          'Por mais que tentem demovê-lo, a sua convicção permanece inabalável.',
          'Por mais que a crítica seja mordaz, o artista recusa-se a ceder ao gosto popular.',
          'Por mais que investigassem, não encontravam qualquer indício de irregularidade.',
          'Por mais que o diálogo se prolongasse, não chegavam a um consenso.',
          'Por mais que argumentasse, a sua voz era sistematicamente ignorada.'
        ]
      },
      {
        pt: 'conquanto',
        zh: '雖然',
        exs: [
          'Conquanto fosse tarde, decidiu sair para a caminhada noturna.',
          'Conquanto o projeto seja ambicioso, dispomos de recursos para o executar.',
          'A tese foi aceite, conquanto careça de revisão em alguns capítulos.',
          'Conquanto as negociações tenham sido difíceis, o acordo foi alcançado.',
          'Manteve a esperança, conquanto todas as evidências apontassem para o fracasso.',
          'Conquanto a paisagem fosse deslumbrante, o cansaço impedia-os de a apreciar.'
        ]
      },
      {
        pt: 'se bem que',
        zh: '儘管（口語）',
        exs: [
          'Se bem que seja arriscado, ele aceitou o desafio.',
          'Gostei do filme, se bem que o final me tenha desapontado.',
          'O restaurante é caro, se bem que a qualidade da comida o justifique.',
          'Se bem que a tarefa pareça simples, requer uma concentração enorme.',
          'Aceito a sugestão, se bem que discorde de alguns pontos fundamentais.',
          'O clima é agradável, se bem que o vento por vezes incomode.'
        ]
      },
      {
        pt: 'posto que',
        zh: '即便（書面）',
        exs: [
          'Posto que seja verdade, não altera o essencial da discussão.',
          'Posto que os resultados sejam animadores, convém manter a prudência.',
          'A petição foi indeferida, posto que os fundamentos fossem juridicamente frágeis.',
          'Posto que a solução seja elegante, a sua aplicação prática é questionável.',
          'O diplomata manteve-se reservado, posto que as tensões fossem evidentes.',
          'Posto que a economia apresente sinais de recuperação, a crise não está totalmente ultrapassada.'
        ]
      },
      {
        pt: 'malgrado',
        zh: '儘管（正式）',
        exs: [
          'Malgrado os obstáculos, perseverou na sua missão humanitária.',
          'Malgrado a oposição ferrenha, o projeto foi aprovado em assembleia.',
          'A conferência decorreu com normalidade, malgrado as ameaças de boicote.',
          'Malgrado os seus esforços, a situação continuou a degradar-se.',
          'O tratado foi assinado, malgrado as reticências de algumas delegações.',
          'Malgrado a idade avançada, mantinha uma lucidez impressionante.'
        ]
      },
      {
        pt: 'sem embargo',
        zh: '儘管（法律用語）',
        exs: [
          'Sem embargo do exposto, a decisão mantém-se nos seus precisos termos.',
          'Sem embargo das dúvidas suscitadas, o parecer jurídico é favorável.',
          'A sentença foi proferida, sem embargo dos recursos interpostos.',
          'Sem embargo das dificuldades logísticas, a operação foi bem-sucedida.',
          'O contrato é válido, sem embargo das cláusulas que carecem de revisão.',
          'Sem embargo do atraso na entrega, a qualidade do trabalho é inquestionável.'
        ]
      },
    ],
  },
  {
    categoria: 'Causa',
    desc: 'Causa, motivo ou justificação',
    items: [
      {
        pt: 'Porque',
        zh: '因為',
        exs: [
          'Ficou em casa porque estava doente.',
          'Não comprei o bilhete porque já não havia lugares.',
          'A escola fechou porque houve um surto de gripe.',
          'Ela está contente porque recebeu uma boa notícia.',
          'Chegámos atrasados porque o trânsito estava horrível.'
        ]
      },
      {
        pt: 'porquanto',
        zh: '因為（正式）',
        exs: [
          'Não foi aceite, porquanto não preenchia os requisitos mínimos exigidos.',
          'A decisão foi revogada, porquanto se baseava em informação incorreta.',
          'O requerimento foi indeferido, porquanto apresentado fora do prazo legal.',
          'A cláusula é nula, porquanto viola disposições constitucionais.',
          'O projeto foi rejeitado, porquanto os custos superavam largamente o orçamento disponível.',
          'A candidatura foi excluída, porquanto a documentação se encontrava incompleta.'
        ]
      },
      {
        pt: 'visto que',
        zh: '鑒於；既然',
        exs: [
          'Visto que os prazos foram ultrapassados, teremos de renegociar o contrato.',
          'A sessão foi suspensa, visto que o orador principal se encontrava indisposto.',
          'Visto que a procura excede a oferta, os preços tenderão a subir.',
          'O parecer é vinculativo, visto que emana de uma entidade reguladora.',
          'Visto que as condições atmosféricas se deterioraram, o voo foi cancelado.',
          'Optámos por adiar a reunião, visto que a maioria dos intervenientes não podia comparecer.'
        ]
      },
      {
        pt: 'dado que',
        zh: '鑒於',
        exs: [
          'Dado que a situação se agravou, urge tomar medidas extraordinárias.',
          'O inquérito foi aberto, dado que surgiram novas provas materiais.',
          'Dado que o consumo interno diminuiu, as exportações tornaram-se prioritárias.',
          'A nomeação foi suspensa, dado que o candidato não reunia as condições legais.',
          'Dado que o acordo caducou, teremos de negociar novos termos.',
          'A investigação prossegue, dado que ainda há muitas perguntas por responder.'
        ]
      },
      {
        pt: 'uma vez que',
        zh: '既然',
        exs: [
          'Uma vez que ninguém se opõe, daremos por aprovada a proposta.',
          'O processo foi arquivado, uma vez que não foram recolhidos indícios suficientes.',
          'Uma vez que a verba já foi atribuída, não podemos reafetá-la.',
          'A viagem foi cancelada, uma vez que as restrições sanitárias se mantinham.',
          'Uma vez que o relatório foi homologado, podem iniciar-se as obras.',
          'Assumimos o compromisso, uma vez que todos os envolvidos manifestaram concordância.'
        ]
      },
      {
        pt: 'já que',
        zh: '既然',
        exs: [
          'Já que estás aqui, aproveita para reveres o documento.',
          'Já que todos concordam, não vale a pena prolongar a discussão.',
          'O evento foi adiado, já que as condições logísticas não estavam reunidas.',
          'Já que a questão foi levantada, importa debruçarmo-nos sobre ela.',
          'Podemos encerrar o assunto, já que não há mais nada a acrescentar.',
          'Já que o tempo urge, passemos à votação.'
        ]
      },
      {
        pt: 'na medida em que',
        zh: '在…程度上',
        exs: [
          'É relevante na medida em que altera o resultado final do processo.',
          'A teoria é inovadora na medida em que questiona pressupostos seculares.',
          'A medida é justificada na medida em que protege os consumidores mais vulneráveis.',
          'O argumento é frágil na medida em que assenta em premissas não verificadas.',
          'A decisão acertou na medida em que privilegiou o interesse público.',
          'O estudo é válido na medida em que a amostra é representativa da população.'
        ]
      },
      {
        pt: 'por isso mesmo',
        zh: '正因如此',
        exs: [
          'O projeto é ambicioso; por isso mesmo, requer uma equipa dedicada.',
          'A tarefa é complexa; por isso mesmo, não podemos subestimá-la.',
          'A proposta é controversa; por isso mesmo, merece ser debatida com profundidade.',
          'O caminho é árduo; por isso mesmo, a recompensa será mais significativa.',
          'A crítica foi construtiva; por isso mesmo, devemos acolhê-la com atenção.',
          'O desafio é inédito; por isso mesmo, temos de o abordar com criatividade.'
        ]
      },
      {
        pt: 'devido a',
        zh: '由於',
        exs: [
          'Devido ao mau tempo, o evento foi cancelado.',
          'Devido a constrangimentos orçamentais, o programa foi suspenso.',
          'Atrasou-se devido a um congestionamento inesperado na autoestrada.',
          'A colheita foi fraca devido à seca prolongada que assolou a região.',
          'Devido a problemas técnicos, a plataforma esteve indisponível durante várias horas.',
          'A demissão deveu-se a divergências estratégicas irreconciliáveis.'
        ]
      },
      {
        pt: 'graças a',
        zh: '幸虧',
        exs: [
          'Graças ao vosso esforço, alcançámos o objetivo.',
          'Graças à intervenção célere dos bombeiros, o incêndio foi controlado.',
          'A empresa sobreviveu graças a uma injeção de capital de emergência.',
          'Graças à perseverança da equipa, o projeto foi concluído dentro do prazo.',
          'A cura foi possível graças aos avanços da medicina molecular.',
          'Graças ao empenho de todos, a campanha de solidariedade foi um êxito retumbante.'
        ]
      },
      {
        pt: 'em virtude de',
        zh: '基於（正式）',
        exs: [
          'Em virtude do exposto, arquiva-se o processo.',
          'Em virtude dos poderes que lhe são conferidos, o presidente dissolverá a assembleia.',
          'A decisão foi tomada em virtude do interesse nacional.',
          'Em virtude do acordo bilateral, os cidadãos beneficiam de isenção de visto.',
          'O arguido foi absolvido em virtude da insuficiência de provas.',
          'Em virtude da sua antiguidade, foi-lhe atribuída a medalha de mérito.'
        ]
      },
    ],
  },
  {
    categoria: 'Conclusão',
    desc: 'Síntese ou consequência lógica',
    items: [
      {
        pt: 'Depois de',
        zh: '在...之後（時間或空間）',
        exs: [
          'Depois de muito pensar, decidiu aceitar a proposta.',
          'O telefone tocou depois de ele sair de casa.',
          'Depois de almoço, vou dar uma volta ao parque.',
          'Ela aprendeu a andar de bicicleta depois de várias tentativas.',
          'Depois de concluída a obra, o edifício foi inaugurado pelo presidente da câmara.'
        ]
      },
      {
        pt: 'Pois',
        zh: '因為、由於、那麼',
        exs: [
          'Não fui à reunião, pois estava doente.',
          'Pois sim, logo se vê o que acontece.',
          'Ele é o mais indicado, pois tem anos de experiência na área.',
          'Pois então, vamos embora que já é tarde.',
          'Acho que sim, pois os sinais são evidentes.'
        ]
      },
      {
        pt: 'Portanto',
        zh: '因此',
        exs: [
          'Choveu torrencialmente; portanto, a festa foi cancelada.',
          'Os indicadores são positivos; portanto, podemos perspetivar um crescimento sustentado.',
          'A investigação não encontrou fundamento para as acusações; portanto, o caso será arquivado.',
          'O candidato não reúne o perfil pretendido; portanto, excluímo-lo da shortlist.',
          'A procura excede largamente a oferta; portanto, os preços tenderão a subir.',
          'Todos os prazos foram cumpridos; portanto, o projeto está oficialmente concluído.'
        ]
      },
      {
        pt: 'Assim',
        zh: '所以；這樣、如此',
        exs: [
          'Assim, podemos concluir que a estratégia resultou.',
          'Ela era assim tão simpática como diziam.',
          'Assim sendo, não há mais nada a acrescentar.',
          'Fez o trabalho assim, sem grande cuidado.',
          'Assim que chegou, cumprimentou todos os presentes.'
        ]
      },
      {
        pt: 'Logo que',
        zh: '一...就 (+ conj./ind.)',
        exs: [
          'Logo que chegou a casa, ligou à mãe.',
          'Logo que o prazo termine, submeteremos a candidatura.',
          'Ela saiu logo que o concerto acabou.',
          'Logo que o sol nasceu, os pescadores fizeram-se ao mar.',
          'Logo que recebermos a confirmação, daremos início às obras.'
        ]
      },
      {
        pt: 'Assim que',
        zh: '一...就 (+ conj./ind.)',
        exs: [
          'Assim que o vi, reconheci-o imediatamente.',
          'Assim que acabar o trabalho, vou descansar.',
          'Ela adormeceu assim que se deitou.',
          'Assim que o alarme tocou, evacuámos o edifício.',
          'Assim que o contrato for assinado, avançamos com o projeto.'
        ]
      },
      {
        pt: 'dessa forma',
        zh: '那樣地',
        exs: [
          'Não devias ter agido dessa forma.',
          'Dessa forma, conseguimos poupar tempo e dinheiro.',
          'Se continuares dessa forma, vais magoar alguém.',
          'Dessa forma, o problema fica resolvido.',
          'Ele explicou o processo dessa forma para ser mais claro.'
        ]
      },
      {
        pt: 'em conclusão',
        zh: '總之；結論是',
        exs: [
          'Em conclusão, o projeto é viável e deve ser aprovado.',
          'Em conclusão, importa salientar os aspetos positivos da iniciativa.',
          'Em conclusão, a evidência apresentada é insuficiente.',
          'Em conclusão, podemos afirmar que a estratégia foi bem-sucedida.',
          'Em conclusão, resta-me agradecer a todos os envolvidos.'
        ]
      },
      {
        pt: 'por conseguinte',
        zh: '因此',
        exs: [
          'O orçamento foi chumbado; por conseguinte, a execução do plano fica comprometida.',
          'A inflação disparou; por conseguinte, o poder de compra das famílias diminuiu.',
          'Os prazos não foram cumpridos; por conseguinte, a cláusula penal será aplicada.',
          'A sentença é desfavorável; por conseguinte, a empresa recorrerá para a instância superior.',
          'O acordo caducou; por conseguinte, teremos de o renegociar de raiz.',
          'Os resultados foram inconclusivos; por conseguinte, o estudo terá de ser repetido.'
        ]
      },
      {
        pt: 'para concluir',
        zh: '為了結尾',
        exs: [
          'Para concluir, gostaria de agradecer a vossa atenção.',
          'Para concluir, resta-nos aprovar a proposta final.',
          'Para concluir, podemos dizer que o saldo é positivo.',
          'Para concluir, importa referir os próximos passos.',
          'Para concluir, deixo-vos com uma reflexão sobre o futuro.'
        ]
      },
      {
        pt: 'não é assim?',
        zh: '不是這樣嗎？',
        exs: [
          'O caminho é este, não é assim?',
          'Já não há bilhetes, não é assim?',
          'Tu vais connosco, não é assim?',
          'A reunião é amanhã, não é assim?',
          'Ele já se foi embora, não é assim?'
        ]
      },
      {
        pt: 'daí que',
        zh: '因此（後接虛擬式）',
        exs: [
          'A situação é insustentável, daí que tenhamos de intervir urgentemente.',
          'O candidato não convenceu o júri, daí que não tenha sido selecionado.',
          'A empresa perdeu quota de mercado, daí que tenha reestruturado a sua estratégia.',
          'O relatório aponta falhas graves, daí que seja necessária uma revisão profunda.',
          'A experiência falhou repetidamente, daí que o método tenha sido abandonado.',
          'O terramoto foi devastador, daí que a ajuda humanitária tenha sido mobilizada de imediato.'
        ]
      },
      {
        pt: 'destarte',
        zh: '如此一來（書面）',
        exs: [
          'Destarte, fica provada a hipótese inicial do investigador.',
          'Destarte, a assembleia deliberou aprovar a moção por maioria absoluta.',
          'Destarte, os pressupostos do modelo foram validados empiricamente.',
          'Destarte, concluímos que a intervenção legislativa se afigura necessária.',
          'Destarte, o tribunal dá por encerrada a instrução do processo.',
          'Destarte, cumpre-nos aguardar a publicação do regulamento em Diário da República.'
        ]
      },
      {
        pt: 'consequentemente',
        zh: '因此',
        exs: [
          'Não estudou; consequentemente, reprovou no exame final.',
          'As receitas diminuíram; consequentemente, a empresa registou prejuízos.',
          'O prazo expirou; consequentemente, a proposta caducou.',
          'O vazamento não foi detetado atempadamente; consequentemente, os danos foram avultados.',
          'A economia contraiu-se; consequentemente, a taxa de desemprego aumentou.',
          'Os documentos extraviaram-se; consequentemente, o processo terá de ser reaberto.'
        ]
      },
      {
        pt: 'logo',
        zh: '所以',
        exs: [
          'Penso, logo existo.',
          'O semáforo está vermelho, logo temos de parar.',
          'A factura não foi paga, logo o serviço será suspenso.',
          'O teste deu positivo, logo o paciente está infetado.',
          'A proposta foi aprovada, logo podemos avançar com a implementação.',
          'Não há consenso, logo a votação terá de ser adiada.'
        ]
      },
      {
        pt: 'por consequência',
        zh: '結果',
        exs: [
          'A inflação subiu; por consequência, o poder de compra caiu.',
          'O acordo foi denunciado; por consequência, as sanções foram reativadas.',
          'Os juros aumentaram; por consequência, o crédito tornou-se mais caro.',
          'A produtividade caiu; por consequência, os salários estagnaram.',
          'A confiança dos investidores abalou-se; por consequência, a bolsa desvalorizou.',
          'A legislação foi alterada; por consequência, as empresas tiveram de se adaptar.'
        ]
      },
      {
        pt: 'assim sendo',
        zh: '既然如此',
        exs: [
          'Assim sendo, nada mais há a discutir.',
          'Assim sendo, damos por encerrada a sessão de hoje.',
          'Assim sendo, cabe-nos aceitar a decisão e seguir em frente.',
          'Assim sendo, a proposta carece de fundamentação adicional.',
          'Assim sendo, urge convocar uma reunião extraordinária.',
          'Assim sendo, não nos resta outra alternativa senão recorrer.'
        ]
      },
      {
        pt: 'donde se conclui que',
        zh: '由此得出',
        exs: [
          'Os custos superam os benefícios, donde se conclui que o projeto é inviável.',
          'A amostra não é representativa, donde se conclui que o estudo carece de validade externa.',
          'Todas as testemunhas corroboram a mesma versão, donde se conclui que o arguém diz a verdade.',
          'Os indicadores são consistentes, donde se conclui que a estratégia adotada é a correta.',
          'Não houve qualquer irregularidade, donde se conclui que as acusações são infundadas.',
          'A receita caiu pelo terceiro trimestre consecutivo, donde se conclui que urge reestruturar a empresa.'
        ]
      },
    ],
  },
  {
    categoria: 'Adição',
    desc: 'Acrescentar informação ou intensificar',
    items: [
      {
        pt: 'Além disso',
        zh: '除此之外',
        exs: [
          'Além disso, importa considerar o impacto ambiental do projeto.',
          'O carro é económico; além disso, é muito confortável.',
          'Além disso, temos de garantir que os prazos são cumpridos.',
          'Ele é licenciado; além disso, tem um mestrado na área.',
          'Além disso, a localização do imóvel é excelente.'
        ]
      },
      {
        pt: 'Quer... quer',
        zh: '無論...還是 (+ conj.)',
        exs: [
          'Quer queiras, quer não, tens de tomar uma decisão.',
          'Quer chova, quer faça sol, o evento realiza-se na mesma.',
          'Quer gostes, quer não, terás de aceitar as regras.',
          'Quer venhas, quer não venhas, avisa-me por favor.',
          'Quer acredites, quer não, isto é verdade.'
        ]
      },
      {
        pt: 'não só... mas também',
        zh: '不僅...而且',
        exs: [
          'Ele não só é inteligente, mas também muito trabalhador.',
          'O filme não só divertiu, mas também fez refletir.',
          'Não só poupámos dinheiro, mas também ganhámos tempo.',
          'O restaurante não só tem boa comida, mas também um atendimento excelente.',
          'Não só os alunos, mas também os professores participaram na iniciativa.'
        ]
      },
      {
        pt: 'não só... como',
        zh: '不僅...而且',
        exs: [
          'Não só é bonito, como também é prático.',
          'Ela não só canta, como dança espetacularmente.',
          'O projeto não só é viável, como trará grandes benefícios.',
          'Não só melhorou a sua saúde, como também a sua autoestima.',
          'O livro não só é instrutivo, como é de leitura agradável.'
        ]
      },
      {
        pt: 'tanto... como',
        zh: '既...又',
        exs: [
          'Tanto o pai como a mãe foram à reunião.',
          'Gosto tanto de praia como de montanha.',
          'Tanto os funcionários como os gestores concordaram com a decisão.',
          'Ele fala tanto inglês como francês corretamente.',
          'Tanto a teoria como a prática são fundamentais.'
        ]
      },
      {
        pt: 'ou... ou',
        zh: '要麼...要麼',
        exs: [
          'Ou vens connosco, ou ficas em casa.',
          'Ou estudas agora, ou vais ter problemas no exame.',
          'Ou aceitas a proposta, ou apresentas uma alternativa.',
          'Ou pagas a fatura hoje, ou o serviço será cortado.',
          'Ou tomamos uma decisão agora, ou perdemos a oportunidade.'
        ]
      },
      {
        pt: 'ora... ora',
        zh: '時而...時而',
        exs: [
          'Ora está contente, ora fica triste sem razão aparente.',
          'Ora chove, ora faz sol, o tempo está muito instável.',
          'Ele ora defende uma posição, ora muda completamente de opinião.',
          'Ora trabalha com entusiasmo, ora mostra-se desmotivado.',
          'O mercado ora sobe, ora desce, é difícil prever.'
        ]
      },
      {
        pt: 'relativamente a',
        zh: '關於；相對',
        exs: [
          'Relativamente a esse assunto, prefiro não comentar.',
          'O parecer relativamente ao projeto foi favorável.',
          'Relativamente ao horário, teremos de o ajustar.',
          'A situação melhorou relativamente ao ano passado.',
          'Relativamente à vossa proposta, temos algumas dúvidas.'
        ]
      },
      {
        pt: 'a respeito de',
        zh: '關於',
        exs: [
          'Gostava de falar contigo a respeito de amanhã.',
          'A respeito do que disseste, tenho uma opinião diferente.',
          'O jornal publicou um artigo a respeito da crise económica.',
          'A respeito do contrato, precisamos de rever algumas cláusulas.',
          'Nada sei a respeito desse assunto.'
        ]
      },
      {
        pt: 'em segundo lugar',
        zh: '其次',
        exs: [
          'Em segundo lugar, gostaria de abordar a questão orçamental.',
          'Primeiro, a segurança; em segundo lugar, a eficiência.',
          'Em segundo lugar, importa referir os custos envolvidos.',
          'Em segundo lugar na lista de prioridades está a formação.',
          'Terminou a prova em segundo lugar, logo atrás do campeão.'
        ]
      },
      {
        pt: 'em último lugar',
        zh: '最後',
        exs: [
          'Em último lugar, agradeço a todos pela colaboração.',
          'Em último lugar na classificação ficou a equipa visitante.',
          'Em último lugar, resta-me desejar-vos boa sorte.',
          'Em último lugar, temos de considerar a sustentabilidade do projeto.',
          'Ficou em último lugar na corrida, mas não desistiu.'
        ]
      },
      {
        pt: 'além de',
        zh: '除了...之外',
        exs: [
          'Além de estudar, ele também trabalha.',
          'Além de caro, o produto é de má qualidade.',
          'Além de Lisboa, visitámos também Porto e Coimbra.',
          'Além de cantar, ela toca piano na perfeição.',
          'Além do salário, recebeu um bónus no final do ano.'
        ]
      },
      {
        pt: 'outra vez',
        zh: '再一次',
        exs: [
          'Podes repetir, outra vez, por favor?',
          'Ele fez a mesma pergunta outra vez.',
          'Outra vez não, já estamos fartos de ouvir a mesma história.',
          'Vou tentar outra vez, mesmo sabendo que é difícil.',
          'A campainha tocou outra vez, quem será?'
        ]
      },
      {
        pt: 'por exemplo',
        zh: '例如',
        exs: [
          'Há muitas frutas que gosto, por exemplo, laranja e maçã.',
          'Por exemplo, se estudares mais, terás melhores notas.',
          'Vários países, por exemplo, Portugal e Espanha, adotaram a mesma medida.',
          'Ele tem muitos hobbies, por exemplo, fotografia e pintura.',
          'Por exemplo, podemos optar por viajar de comboio em vez de avião.'
        ]
      },
      {
        pt: 'em primeiro lugar',
        zh: '首先',
        exs: [
          'Em primeiro lugar, temos de definir os objetivos.',
          'Em primeiro lugar, quero agradecer a vossa presença.',
          'Em primeiro lugar na fila estava uma senhora idosa.',
          'Em primeiro lugar, devemos garantir a segurança de todos.',
          'Ela ficou em primeiro lugar no concurso de ortografia.'
        ]
      },
      {
        pt: 'outrossim',
        zh: '此外（正式）',
        exs: [
          'O documento é válido; outrossim, deve ser registado no serviço competente.',
          'O relatório está concluído; outrossim, importa submetê-lo a parecer externo.',
          'O arguido confessou o crime; outrossim, colaborou ativamente com a investigação.',
          'A proposta é inovadora; outrossim, revela-se economicamente viável.',
          'O parecer é favorável; outrossim, recomenda-se a aprovação do projeto.',
          'A sentença é definitiva; outrossim, não há lugar a recurso ordinário.'
        ]
      },
      {
        pt: 'ademais',
        zh: '此外',
        exs: [
          'Ademais, importa referir os aspetos culturais subjacentes.',
          'O candidato tem experiência; ademais, domina três línguas estrangeiras.',
          'A solução é eficiente; ademais, é ecologicamente sustentável.',
          'Ademais, convém salientar que o orçamento já foi aprovado.',
          'O programa é abrangente; ademais, está alinhado com as diretrizes europeias.',
          'Ademais, a evidência empírica corrobora a tese defendida.'
        ]
      },
      {
        pt: 'bem como',
        zh: '以及',
        exs: [
          'Os alunos, bem como os professores, participaram na greve.',
          'O tratado abrange a cooperação económica, bem como a cultural.',
          'A empresa fornece equipamento, bem como formação especializada.',
          'Importa preservar o património edificado, bem como o imaterial.',
          'A proposta inclui a revisão salarial, bem como a atualização de benefícios.',
          'Foram afetados os residentes, bem como os comerciantes da zona.'
        ]
      },
      {
        pt: 'não só… como também',
        zh: '不僅…而且',
        exs: [
          'A medida é não só necessária como também urgente.',
          'O orador foi não só eloquente como também convincente.',
          'A reforma é não só desejável como também inevitável.',
          'O projeto não só cumpre os requisitos como também excede as expectativas.',
          'A decisão foi não só acertada como também corajosa.',
          'O livro é não só instrutivo como também profundamente comovente.'
        ]
      },
      {
        pt: 'além do mais',
        zh: '再者',
        exs: [
          'Além do mais, a proposta é economicamente viável a longo prazo.',
          'O imóvel é espaçoso; além do mais, está numa localização privilegiada.',
          'Além do mais, o parecer jurídico é favorável à nossa pretensão.',
          'O candidato é competente; além do mais, demonstrou enorme dedicação.',
          'Além do mais, a tecnologia adotada é comprovadamente fiável.',
          'O acordo é vantajoso; além do mais, fortalece as relações bilaterais.'
        ]
      },
      {
        pt: 'para mais',
        zh: '何況',
        exs: [
          'Para mais, o prazo já expirou há duas semanas.',
          'O trabalho é exigente; para mais, a remuneração é baixa.',
          'Para mais, a situação agravou-se com a entrada em vigor da nova lei.',
          'O trânsito está caótico; para mais, não há estacionamento disponível.',
          'Para mais, os custos operacionais não param de aumentar.',
          'A tarefa é minuciosa; para mais, requer uma concentração absoluta.'
        ]
      },
      {
        pt: 'tanto… quanto',
        zh: '既…又',
        exs: [
          'Tanto os residentes quanto os turistas foram afetados pelas cheias.',
          'A decisão foi tomada tanto com base em critérios económicos quanto sociais.',
          'Tanto a direção quanto os sindicatos se mostraram recetivos ao diálogo.',
          'O fenômeno foi observado tanto em Portugal quanto no Brasil.',
          'Tanto a teoria quanto a prática confirmam a hipótese formulada.',
          'A política beneficiou tanto o setor público quanto o privado.'
        ]
      },
      {
        pt: 'inclusivamente',
        zh: '甚至',
        exs: [
          'Todos participaram, inclusivamente os mais céticos.',
          'A medida foi aplaudida, inclusivamente pela oposição.',
          'O festival atraiu visitantes de todo o país, inclusivamente do estrangeiro.',
          'Inclusivamente os críticos mais ferrenhos reconheceram o mérito da obra.',
          'O desconto aplica-se a todos os produtos, inclusivamente aos que estão em promoção.',
          'A notícia foi divulgada, inclusivamente nos meios de comunicação internacionais.'
        ]
      },
    ],
  },
  {
    categoria: 'Oposição',
    desc: 'Contraste entre ideias',
    items: [
      {
        pt: 'Mas',
        zh: '但是、可是',
        exs: [
          'Queria ir, mas estava muito cansado.',
          'O carro é bonito, mas é muito caro.',
          'Estudou muito, mas não conseguiu passar.',
          'Gosto de praia, mas prefiro montanha.',
          'A sopa estava quente, mas mesmo assim comi-a toda.'
        ]
      },
      {
        pt: 'Contudo',
        zh: '然而、儘管如此',
        exs: [
          'O projeto é ambicioso; contudo, é perfeitamente exequível.',
          'Choveu muito; contudo, a festa não foi cancelada.',
          'Ele prometeu ajudar; contudo, nunca apareceu.',
          'A teoria é sólida; contudo, a prática revela limitações.',
          'O preço é elevado; contudo, a qualidade justifica-o.'
        ]
      },
      {
        pt: 'Todavia',
        zh: '然而',
        exs: [
          'A situação é grave; todavia, há motivos para esperança.',
          'Todavia, importa salientar que os resultados não são definitivos.',
          'O candidato é inexperiente; todavia, demonstra grande potencial.',
          'As negociações foram difíceis; todavia, chegou-se a um acordo.',
          'Todavia, nem todos concordam com a decisão tomada.'
        ]
      },
      {
        pt: 'Porém',
        zh: '但是',
        exs: [
          'Quis ajudá-lo, porém ele recusou.',
          'O plano é bom, porém precisa de ser ajustado.',
          'Ela é simpática, porém muito reservada.',
          'A comida era excelente, porém o serviço deixou a desejar.',
          'O tempo estava mau, porém fomos assim mesmo à praia.'
        ]
      },
      {
        pt: 'ao invés de',
        zh: '相反；而不是',
        exs: [
          'Ao invés de reclamar, devias apresentar soluções.',
          'Ao invés de ficar em casa, preferiu sair com os amigos.',
          'Ao invés de poupar, gastou todo o dinheiro.',
          'Ao invés de criticar, tenta compreender o outro lado.',
          'Ao invés de desistir, ela redobrou os esforços.'
        ]
      },
      {
        pt: 'ao passo que',
        zh: '而；與此同時',
        exs: [
          'O norte do país é industrializado, ao passo que o sul é predominantemente agrícola.',
          'Uns defendem a privatização, ao passo que outros advogam a manutenção do setor público.',
          'A geração mais velha prefere o jornal impresso, ao passo que os jovens optam pelo digital.',
          'O candidato A é experiente, ao passo que o B é claramente mais inovador.',
          'A economia europeia estagnou, ao passo que a asiática continuou a crescer.',
          'O discurso oficial promete mudança, ao passo que a prática revela continuísmo.'
        ]
      },
      {
        pt: 'em contrapartida',
        zh: '反之',
        exs: [
          'Perdeu o emprego; em contrapartida, ganhou liberdade para prosseguir novos projetos.',
          'O investimento é elevado; em contrapartida, o retorno esperado é proporcional.',
          'A solução é mais morosa; em contrapartida, é substancialmente mais barata.',
          'O tratamento é agressivo; em contrapartida, oferece melhores taxas de cura.',
          'A localização é periférica; em contrapartida, o imóvel é muito mais espaçoso.',
          'O acordo implicou concessões; em contrapartida, garantiu a paz social.'
        ]
      },
      {
        pt: 'por outro lado',
        zh: '另一方面',
        exs: [
          'É caro; por outro lado, a qualidade é superior à média do mercado.',
          'A decisão é impopular; por outro lado, era a única alternativa viável.',
          'O processo é burocrático; por outro lado, garante a transparência necessária.',
          'A empresa reduziu custos; por outro lado, comprometeu a qualidade do serviço.',
          'O clima é rigoroso; por outro lado, a paisagem natural é deslumbrante.',
          'A medida é restritiva; por outro lado, protege os consumidores mais vulneráveis.'
        ]
      },
      {
        pt: 'ao invés',
        zh: '相反',
        exs: [
          'Não se retraiu; ao invés, avançou com redobrada determinação.',
          'O governo não cortou despesas; ao invés, aumentou o investimento público.',
          'A taxa de desemprego não subiu; ao invés, registou uma ligeira descida.',
          'Os alunos não desistiram; ao invés, empenharam-se ainda mais.',
          'A empresa não se demitiu das responsabilidades; ao invés, assumiu-as plenamente.',
          'O país não fechou as fronteiras; ao invés, reforçou a cooperação internacional.'
        ]
      },
      {
        pt: 'pelo contrário',
        zh: '相反',
        exs: [
          'Não está pior; pelo contrário, melhorou significativamente.',
          'A crise não enfraqueceu a instituição; pelo contrário, fortaleceu-a.',
          'O diálogo não azedou as relações; pelo contrário, aproximou as partes.',
          'A concorrência não prejudicou; pelo contrário, estimulou a inovação.',
          'A reforma não criou instabilidade; pelo contrário, trouxe previsibilidade.',
          'O erro não o desmoralizou; pelo contrário, motivou-o a superar-se.'
        ]
      },
      {
        pt: 'em vez de',
        zh: '而不是',
        exs: [
          'Em vez de criticar, devia apresentar soluções concretas.',
          'Optou por ficar calado em vez de defender a sua posição.',
          'Em vez de reduzir a despesa, o governo aumentou-a.',
          'Devia ter investido em formação em vez de contratar consultores externos.',
          'Em vez de simplificar o processo, a nova lei tornou-o ainda mais complexo.',
          'Preferiu demitir-se em vez de compactuar com as irregularidades.'
        ]
      },
      {
        pt: 'diferentemente de',
        zh: '與…不同',
        exs: [
          'Diferentemente do esperado, o resultado foi amplamente positivo.',
          'Diferentemente dos concorrentes, a empresa apostou na sustentabilidade.',
          'Diferentemente do que foi anunciado, a medida não entrou em vigor na data prevista.',
          'Diferentemente do irmão, sempre foi um aluno aplicado e disciplinado.',
          'Diferentemente do modelo anterior, este é mais eficiente e económico.',
          'Diferentemente de outros países, Portugal manteve a neutralidade no conflito.'
        ]
      },
      {
        pt: 'enquanto que',
        zh: '而',
        exs: [
          'O sul é mais próspero, enquanto que o norte enfrenta dificuldades estruturais.',
          'Uns preferem o campo, enquanto que outros optam pela cidade.',
          'A geração digital é mais rápida na absorção de informação, enquanto que a anterior é mais reflexiva.',
          'O setor público está estagnado, enquanto que o privado continua a crescer.',
          'No verão as temperaturas são amenas, enquanto que no inverno são rigorosas.',
          'Uns defendem a tradição, enquanto que outros advogam a inovação.'
        ]
      },
      {
        pt: 'senão',
        zh: '否則',
        exs: [
          'Tens de estudar, senão vais reprovar no exame.',
          'É preciso cumprir o regulamento, senão as sanções serão aplicadas.',
          'Devemos agir rapidamente, senão a oportunidade perder-se-á.',
          'A empresa precisa de se reestruturar, senão a falência é inevitável.',
          'Importa respeitar os prazos, senão a cláusula penal será acionada.',
          'Temos de negociar com boa-fé, senão o acordo inviabilizar-se-á.'
        ]
      },
    ],
  },
  {
    categoria: 'Condição',
    desc: 'Hipóteses ou pré-requisitos',
    items: [
      {
        pt: 'A seguir a',
        zh: '緊接著...',
        exs: [
          'A seguir ao almoço, temos uma reunião importante.',
          'A seguir a ela, falará o presidente da associação.',
          'A seguir a este episódio, a série tornou-se mais interessante.',
          'Ele entrou a seguir a mim, sem bater à porta.',
          'A seguir à tempestade, o céu ficou limpo.'
        ]
      },
      {
        pt: 'Se',
        zh: '如果；是否',
        exs: [
          'Se estudares, vais ter boas notas.',
          'Se tiver tempo, passo por lá amanhã.',
          'Não sei se ele vai gostar da surpresa.',
          'Se quiseres, podemos ir ao cinema hoje.',
          'Se chover, o piquenique fica para outro dia.'
        ]
      },
      {
        pt: 'Caso',
        zh: '萬一、如果；案件、情況',
        exs: [
          'Caso não possas vir, avisa com antecedência.',
          'Caso chova, o concerto será no interior.',
          'Em caso de dúvida, consulta o regulamento.',
          'Caso aceites a proposta, assina o contrato.',
          'O caso foi entregue ao tribunal competente.'
        ]
      },
      {
        pt: 'contanto que',
        zh: '只要',
        exs: [
          'Podes sair, contanto que voltes antes da meia-noite.',
          'Aceitamos a proposta, contanto que as cláusulas sejam renegociadas.',
          'Contanto que haja financiamento, o projeto avançará.',
          'Podes contar connosco, contanto que cumpras a tua parte.',
          'Contanto que o prazo seja alargado, entregaremos o relatório com a qualidade exigida.',
          'O acordo é viável, contanto que ambas as partes cedam nas questões acessórias.'
        ]
      },
      {
        pt: 'desde que',
        zh: '只要、自從',
        exs: [
          'Podes participar, desde que respeites as regras estabelecidas.',
          'Desde que o orçamento seja aprovado, as obras arrancam já no próximo mês.',
          'O apoio será concedido, desde que o projeto cumpra os critérios de elegibilidade.',
          'Desde que haja transparência, não nos opomos à investigação.',
          'A parceria é benéfica, desde que os termos sejam equitativos.',
          'Desde que te comprometas com o plano, terás todo o meu apoio.'
        ]
      },
      {
        pt: 'Ou seja',
        zh: '也就是說',
        exs: [
          'Ou seja, temos de começar tudo de novo.',
          'Ele é vegetariano, ou seja, não come carne nem peixe.',
          'Ou seja, a proposta foi rejeitada por unanimidade.',
          'O prazo expirou, ou seja, já não podemos candidatar-nos.',
          'Ou seja, precisamos de mais tempo para concluir o trabalho.'
        ]
      },
      {
        pt: 'Seja... seja',
        zh: '無論...還是 (+ conj.)',
        exs: [
          'Seja qual for a decisão, teremos de a acatar.',
          'Seja de manhã, seja de tarde, ele está sempre ocupado.',
          'Seja rico, seja pobre, todos merecem respeito.',
          'Seja através do correio, seja por email, enviaremos a documentação.',
          'Seja qual for o resultado, fizemos o nosso melhor.'
        ]
      },
      {
        pt: 'a não ser que',
        zh: '除非（後接虛擬式）',
        exs: [
          'Não sairemos daqui, a não ser que nos apresentem uma solução viável.',
          'O contrato manter-se-á em vigor, a não ser que uma das partes o denuncie.',
          'Não aprovaremos a proposta, a não ser que as alterações sugeridas sejam incorporadas.',
          'A greve continua, a não ser que haja uma negociação de última hora.',
          'Não divulgaremos os dados, a não ser que haja autorização expressa dos visados.',
          'O processo não avança, a não ser que sejam apresentados novos elementos de prova.'
        ]
      },
      {
        pt: 'salvo se',
        zh: '除非',
        exs: [
          'Salvo se houver imprevistos de última hora, a reunião realiza-se amanhã.',
          'O plano mantém-se, salvo se as condições de mercado se alterarem drasticamente.',
          'Salvo se o tribunal decidir em contrário, a sentença é válida.',
          'O acordo vigorará, salvo se for denunciado por qualquer das partes.',
          'Salvo se surgirem novas evidências, o caso será arquivado.',
          'O voo parte conforme o horário, salvo se as condições meteorológicas o impedirem.'
        ]
      },
      {
        pt: 'a menos que',
        zh: '除非',
        exs: [
          'Aceito, a menos que haja alternativa melhor disponível.',
          'O projeto continuará, a menos que o financiamento seja cortado.',
          'A menos que a situação se agrave, não será necessário evacuar a zona.',
          'Não interferiremos, a menos que nos solicitem expressamente.',
          'O tratado será ratificado, a menos que o parlamento o rejeite.',
          'A menos que surja uma oportunidade extraordinária, manteremos a estratégia atual.'
        ]
      },
      {
        pt: 'na eventualidade de',
        zh: '萬一（正式）',
        exs: [
          'Na eventualidade de ocorrer um imprevisto, contactem-me de imediato.',
          'Na eventualidade de o projeto exceder o orçamento, será necessário reafetar verbas.',
          'Na eventualidade de não comparecer, o suplente assumirá as minhas funções.',
          'Na eventualidade de uma catástrofe natural, o plano de contingência será acionado.',
          'Na eventualidade de o acordo ser chumbado, teremos de renegociar os termos.',
          'Na eventualidade de a doença ser benigna, o tratamento será exclusivamente farmacológico.'
        ]
      },
      {
        pt: 'no caso de',
        zh: '萬一',
        exs: [
          'No caso de não poderes comparecer, avisa-nos com antecedência.',
          'No caso de se verificarem irregularidades, será instaurado um inquérito.',
          'No caso de o prazo ser insuficiente, podemos solicitar uma prorrogação.',
          'No caso de o pagamento não ser efetuado, o serviço será suspenso.',
          'No caso de a proposta ser rejeitada, apresentaremos recurso.',
          'No caso de a obra exceder o calendário previsto, as penalidades contratuais serão aplicadas.'
        ]
      },
      {
        pt: 'a título de',
        zh: '以…的名義/作為',
        exs: [
          'Apresento estes dados a título de exemplo ilustrativo.',
          'A título de curiosidade, refira-se que o edifício tem mais de duzentos anos.',
          'Fez a doação a título de reconhecimento pelo apoio recebido.',
          'A título de esclarecimento adicional, anexamos o parecer jurídico.',
          'Interveio a título de mediador no conflito laboral.',
          'A título de exceção, o prazo de candidatura foi alargado por mais uma semana.'
        ]
      },
    ],
  },
  {
    categoria: 'Finalidade',
    desc: 'Objetivo ou intenção',
    items: [
      {
        pt: 'Para que',
        zh: '為了',
        exs: [
          'Estudo para que o meu futuro seja melhor.',
          'Fechei a janela para que não entrasse frio.',
          'Ele fez um curso para que pudesse progredir na carreira.',
          'Avisámos todos para que ninguém se esquecesse.',
          'Ela poupa dinheiro para que possa viajar no próximo ano.'
        ]
      },
      {
        pt: 'a fim de que',
        zh: '為了',
        exs: [
          'A lei foi alterada a fim de que o sistema se tornasse mais equitativo.',
          'O regulamento foi revisto a fim de que as lacunas identificadas fossem colmatadas.',
          'A sessão foi encurtada a fim de que todos pudessem intervir.',
          'O equipamento foi atualizado a fim de que a produção se tornasse mais eficiente.',
          'A formação foi concebida a fim de que os colaboradores adquirissem novas competências.',
          'O protocolo foi assinado a fim de que a cooperação bilateral se intensificasse.'
        ]
      },
      {
        pt: 'para que',
        zh: '為了',
        exs: [
          'Estudou afincadamente para que pudesse ingressar na universidade.',
          'O governo legislou para que o mercado se tornasse mais transparente.',
          'Reforçámos a segurança para que não voltassem a ocorrer intrusões.',
          'A empresa investiu em I&D para que se mantivesse competitiva.',
          'O manual foi traduzido para que todos os colaboradores o compreendessem.',
          'O prazo foi alargado para que houvesse tempo para uma análise mais aprofundada.'
        ]
      },
      {
        pt: 'com o intuito de',
        zh: '以…為目的',
        exs: [
          'Viajou para o estrangeiro com o intuito de aprofundar os seus conhecimentos linguísticos.',
          'A associação foi fundada com o intuito de defender os direitos dos consumidores.',
          'O programa foi criado com o intuito de promover a inclusão social.',
          'Deslocou-se à capital com o intuito de participar na cimeira.',
          'O projeto foi desenvolvido com o intuito de reduzir a pegada ecológica.',
          'A iniciativa partiu com o intuito de sensibilizar a população para a problemática ambiental.'
        ]
      },
      {
        pt: 'com o propósito de',
        zh: '出於…目的',
        exs: [
          'Fê-lo com o propósito de ajudar os mais desfavorecidos.',
          'A delegação deslocou-se ao país com o propósito de negociar um acordo comercial.',
          'O artigo foi escrito com o propósito de desmistificar crenças populares.',
          'A campanha foi lançada com o propósito de angariar fundos para a investigação.',
          'A comissão foi criada com o propósito de fiscalizar a execução orçamental.',
          'O protocolo foi estabelecido com o propósito de harmonizar os procedimentos.'
        ]
      },
      {
        pt: 'de modo a que',
        zh: '以便',
        exs: [
          'Agenda a reunião de modo a que todos possam comparecer.',
          'O sistema foi redesenhado de modo a que a navegação se tornasse mais intuitiva.',
          'A estrutura foi reforçada de modo a que resistisse a sismos de elevada magnitude.',
          'A lei foi clarificada de modo a que não restassem dúvidas interpretativas.',
          'O orçamento foi ajustado de modo a que todas as rubricas fossem contempladas.',
          'O regulamento foi simplificado de modo a que a sua aplicação fosse mais célere.'
        ]
      },
      {
        pt: 'no sentido de',
        zh: '以…為方向',
        exs: [
          'Trabalhamos no sentido de melhorar continuamente o serviço prestado.',
          'As medidas foram adotadas no sentido de mitigar os efeitos da crise.',
          'A empresa reorientou a sua estratégia no sentido de apostar na inovação.',
          'O governo legislou no sentido de proteger os direitos dos trabalhadores.',
          'A investigação avançou no sentido de encontrar uma cura para a doença.',
          'Os esforços convergiram no sentido de alcançar um consenso alargado.'
        ]
      },
    ],
  },
  {
    categoria: 'Comparação',
    desc: 'Analogias ou paralelos',
    items: [
      {
        pt: 'Conforme',
        zh: '按照、根據；一致的',
        exs: [
          'Conforme combinado, enviarei o relatório amanhã.',
          'As obras decorrem conforme o planeado.',
          'Conforme já foi dito, a decisão é irreversível.',
          'O resultado foi conforme as expectativas.',
          'Conforme o regulamento, todos os candidatos devem apresentar a documentação necessária.'
        ]
      },
      {
        pt: 'assim como',
        zh: '如同',
        exs: [
          'Assim como o pai, o filho é médico de renome.',
          'Assim como a economia global, a nacional também ressentiu a crise.',
          'Assim como esperávamos, os resultados confirmaram a hipótese inicial.',
          'Assim como o incêndio alastrou na floresta, o pânico alastrou entre a população.',
          'Assim como os reformistas defendem, a mudança é incontornável.',
          'Assim como nos anos anteriores, o evento esgotou semanas antes da data.'
        ]
      },
      {
        pt: 'tal como',
        zh: '正如',
        exs: [
          'Tal como havíamos previsto, a situação agravou-se.',
          'Tal como consta do relatório, as receitas superaram as despesas.',
          'Tal como foi acordado, a primeira tranche já foi transferida.',
          'Tal como o exemplo anterior demonstra, a abordagem é eficaz.',
          'Tal como sucedeu com outros países, Portugal adotou a mesma diretiva.',
          'Tal como o orador salientou, é imperativo agir com celeridade.'
        ]
      },
      {
        pt: 'à semelhança de',
        zh: '如同…一樣',
        exs: [
          'À semelhança de outros países europeus, Portugal reduziu a taxa de IRS.',
          'À semelhança do ocorrido no ano transato, o festival volta a realizar-se em julho.',
          'À semelhança do que sucedeu com o irmão, optou por estudar engenharia.',
          'À semelhança do modelo anterior, o novo sistema é de código aberto.',
          'À semelhança de outras capitais, Lisboa investiu na mobilidade sustentável.',
          'À semelhança dos demais candidatos, apresentou a documentação exigida.'
        ]
      },
      {
        pt: 'do mesmo modo',
        zh: '同樣地',
        exs: [
          'Do mesmo modo, podemos aplicar esta lógica a outros contextos.',
          'A primeira fase correu bem; do mesmo modo, esperamos que a segunda seja bem-sucedida.',
          'Do mesmo modo que a procura aumentou, a oferta teve de se adaptar.',
          'O departamento financeiro foi reestruturado; do mesmo modo, o departamento comercial.',
          'Do mesmo modo, importa salientar a importância da formação contínua.',
          'A atitude foi louvável; do mesmo modo, o resultado superou as expectativas.'
        ]
      },
      {
        pt: 'de igual forma',
        zh: '同樣',
        exs: [
          'De igual forma, o segundo grupo registou melhorias significativas.',
          'O primeiro ensaio foi bem-sucedido; de igual forma, o segundo validou a teoria.',
          'De igual forma, os cidadãos foram chamados a pronunciar-se sobre a matéria.',
          'A formação teórica foi proveitosa; de igual forma, a componente prática revelou-se essencial.',
          'De igual forma, os parceiros internacionais manifestaram a sua disponibilidade.',
          'A empresa melhorou a eficiência; de igual forma, reduziu os custos operacionais.'
        ]
      },
      {
        pt: 'tanto… como',
        zh: '既…又',
        exs: [
          'Tanto os professores como os alunos foram afetados pela greve.',
          'A medida beneficia tanto as grandes empresas como as pequenas e médias.',
          'Tanto a investigação como o desenvolvimento foram financiados.',
          'A política visa tanto o crescimento económico como a coesão social.',
          'Tanto o público como a crítica elogiaram a peça teatral.',
          'Tanto a nível nacional como internacional, a iniciativa foi bem recebida.'
        ]
      },
    ],
  },
  {
    categoria: 'Reformulação',
    desc: 'Explicar de outro modo',
    items: [
      {
        pt: 'de resto',
        zh: '其餘地；此外',
        exs: [
          'De resto, está tudo em ordem como esperado.',
          'O quarto é confortável; de resto, a casa de banho precisa de obras.',
          'De resto, não tenho mais nada a acrescentar ao que foi dito.',
          'O almoço estava bom; de resto, o serviço foi excelente.',
          'De resto, a situação mantém-se estável.'
        ]
      },
      {
        pt: 'quer dizer',
        zh: '意思是',
        exs: [
          'Vou de férias, quer dizer, se conseguir tirar dias no trabalho.',
          'Ele está atrasado, quer dizer, não vem almoçar connosco.',
          'Ela é médica, quer dizer, ainda está a fazer o internato.',
          'O projeto foi aprovado, quer dizer, temos luz verde para avançar.',
          'Vou mudar de casa, quer dizer, se encontrar um arrendamento acessível.'
        ]
      },
      {
        pt: 'ipsis verbis',
        zh: '一字不差地',
        exs: [
          'O juiz leu a sentença ipsis verbis.',
          'Repetiu ipsis verbis o que o professor tinha dito.',
          'A testemunha confirmou ipsis verbis o depoimento anterior.',
          'Transcrevo ipsis verbis o parágrafo em questão.',
          'Citou ipsis verbis o artigo do código civil.'
        ]
      },
      {
        pt: 'na verdade',
        zh: '事實上',
        exs: [
          'Na verdade, o problema é mais complexo do que parece.',
          'Ele disse que sim, mas na verdade não concordava.',
          'Na verdade, eu já sabia dessa notícia há dias.',
          'Parece fácil, mas na verdade requer muita prática.',
          'Na verdade, nunca lhe perguntaram a opinião.'
        ]
      },
      {
        pt: 'ou seja',
        zh: '也就是說',
        exs: [
          'O prazo expirou, ou seja, a proposta caducou.',
          'A empresa está insolvente, ou seja, não tem capacidade para pagar as dívidas.',
          'O candidato foi excluído, ou seja, não reúne as condições de elegibilidade.',
          'A inflação subiu, ou seja, o poder de compra das famílias diminuiu.',
          'O projeto foi chumbado, ou seja, não terá financiamento público.',
          'A sentença é definitiva, ou seja, não há lugar a recurso.'
        ]
      },
      {
        pt: 'isto é',
        zh: '即',
        exs: [
          'Está desempregado, isto é, não exerce atualmente qualquer atividade profissional remunerada.',
          'A empresa faliu, isto é, encerrou definitivamente a sua atividade.',
          'O acordo foi denunciado, isto é, uma das partes rescindiu unilateralmente.',
          'O paciente está em remissão, isto é, a doença não apresenta sintomas ativos.',
          'O orçamento foi aprovado, isto é, a despesa está autorizada.',
          'O processo foi arquivado, isto é, não há matéria para prosseguir com a investigação.'
        ]
      },
      {
        pt: 'por outras palavras',
        zh: '換言之',
        exs: [
          'É pragmático; por outras palavras, foca-se exclusivamente nos resultados.',
          'A situação é insustentável; por outras palavras, estamos perante uma crise sistémica.',
          'O relatório é inconclusivo; por outras palavras, não permite tirar ilações definitivas.',
          'A empresa reestruturou-se; por outras palavras, reduziu drasticamente os efetivos.',
          'O acordo é desfavorável; por outras palavras, lesa os interesses nacionais.',
          'O método é obsoleto; por outras palavras, não responde às exigências atuais.'
        ]
      },
      {
        pt: 'dito de outro modo',
        zh: '換個說法',
        exs: [
          'Dito de outro modo, a situação é mais grave do que aparenta.',
          'Dito de outro modo, a decisão cabe exclusivamente ao conselho de administração.',
          'Dito de outro modo, não há margem para negociação.',
          'Dito de outro modo, o projeto carece de viabilidade económica.',
          'Dito de outro modo, o problema reside na falta de coordenação institucional.',
          'Dito de outro modo, a proposta é inaceitável nos seus atuais termos.'
        ]
      },
      {
        pt: 'melhor dizendo',
        zh: '更準確地說',
        exs: [
          'Não gostou; melhor dizendo, detestou veementemente.',
          'O projeto não fracassou; melhor dizendo, não correspondeu às expectativas iniciais.',
          'Não está arrependido; melhor dizendo, reconhece que poderia ter agido de forma diferente.',
          'A empresa não fechou; melhor dizendo, foi vendida a um grupo estrangeiro.',
          'Não se trata de uma opinião; melhor dizendo, é um facto comprovado.',
          'Não é apenas difícil; melhor dizendo, é virtualmente impossível nas condições atuais.'
        ]
      },
      {
        pt: 'a saber',
        zh: '即（列舉）',
        exs: [
          'Três países, a saber: Portugal, Brasil e Angola.',
          'O regulamento abrange vários aspetos, a saber, os prazos, as penalidades e as exceções.',
          'A comissão é composta por cinco membros, a saber: o presidente, o vice-presidente e três vogais.',
          'Foram identificados três problemas principais, a saber, a falta de funding, a escassez de mão de obra e a burocracia.',
          'A empresa atua em vários setores, a saber, telecomunicações, banca e energia.',
          'O relatório aborda quatro dimensões, a saber, a económica, a social, a ambiental e a cultural.'
        ]
      },
    ],
  },
  {
    categoria: 'Tempo',
    desc: 'Relações temporais',
    items: [
      {
        pt: 'Antes de',
        zh: '在...之前（時間或空間）',
        exs: [
          'Antes de sair, fechei a porta à chave.',
          'Liga-me antes de entrares na reunião.',
          'Antes do jantar, gosto de dar um passeio.',
          'Ela chegou antes de todos os outros.',
          'Antes de decidires, pensa bem nas consequências.'
        ]
      },
      {
        pt: 'Enquanto',
        zh: '當...之際、然而',
        exs: [
          'Enquanto esperava, li um livro.',
          'Ela canta enquanto toma banho.',
          'Enquanto uns trabalham, outros descansam.',
          'O telefone tocou enquanto eu dormia.',
          'Enquanto houver esperança, não desistiremos.'
        ]
      },
      {
        pt: 'hoje em dia',
        zh: '現今',
        exs: [
          'Hoje em dia, quase toda a gente tem um smartphone.',
          'Hoje em dia, é raro ver crianças a brincar na rua.',
          'Antigamente as cartas demoravam dias; hoje em dia, chegam num instante.',
          'Hoje em dia, o teletrabalho tornou-se uma prática comum.',
          'Hoje em dia, há muita gente preocupada com o ambiente.'
        ]
      },
      {
        pt: 'já não',
        zh: '不再',
        exs: [
          'Já não fumo como antes.',
          'Ele já não mora aqui, mudou-se para o Porto.',
          'Já não há pão, vou comprar mais.',
          'Ela já não se lembra do que aconteceu naquele dia.',
          'Já não temos tempo para acabar o projeto hoje.'
        ]
      },
      {
        pt: 'tão... que',
        zh: '如此...以至於',
        exs: [
          'Estava tão cansado que adormeceu no sofá.',
          'A música era tão alta que os vizinhos se queixaram.',
          'Ele é tão teimoso que ninguém o convence.',
          'O bolo estava tão bom que comi três fatias.',
          'A fila era tão grande que desistimos de esperar.'
        ]
      },
      {
        pt: 'de maneira que',
        zh: '以至於',
        exs: [
          'Choveu tanto, de maneira que as ruas alagaram.',
          'Fez um discurso tão convincente, de maneira que todos o aplaudiram.',
          'O trânsito estava tão mau, de maneira que cheguei atrasado.',
          'Estudou tanto, de maneira que passou no exame com distinção.',
          'A comida era tão picante, de maneira que não consegui comer.'
        ]
      },
      {
        pt: 'de modo que',
        zh: '以至於',
        exs: [
          'O som estava tão alto, de modo que tive de tapar os ouvidos.',
          'Ela treinou tanto, de modo que venceu a competição.',
          'O trânsito estava congestionado, de modo que perdemos o voo.',
          'A luz era tão forte, de modo que tive de usar óculos escuros.',
          'O discurso foi tão emocionante, de modo que comoveu toda a plateia.'
        ]
      },
      {
        pt: 'à medida que',
        zh: '隨著',
        exs: [
          'À medida que o tempo passa, a saudade aumenta.',
          'À medida que envelhecemos, ganhamos mais sabedoria.',
          'O preço do petróleo sobe à medida que a procura aumenta.',
          'À medida que o sol se punha, o céu ficava mais vermelho.',
          'A ansiedade crescia à medida que a data se aproximava.'
        ]
      },
    ],
  },
  {
    categoria: 'Espaço / Localização',
    desc: 'Relações espaciais',
    items: [
      {
        pt: 'Em cima de',
        zh: '在...上面',
        exs: [
          'O livro está em cima da mesa.',
          'Põe o copo em cima do tampo, por favor.',
          'O gato saltou para cima do telhado.',
          'Ela colocou as chaves em cima da estante.',
          'O quadro está pendurado em cima do sofá.'
        ]
      },
      {
        pt: 'Debaixo de',
        zh: '在...下面',
        exs: [
          'O gato escondeu-se debaixo da cama.',
          'Encontrámos as chaves debaixo do tapete.',
          'O cão dorme sempre debaixo da mesa.',
          'Há uma fuga de água debaixo do lava-loiças.',
          'O tesouro estava enterrado debaixo da árvore.'
        ]
      },
      {
        pt: 'Ao lado de',
        zh: '在...旁邊',
        exs: [
          'O supermercado fica ao lado da minha casa.',
          'Senta-te ao lado dela, por favor.',
          'Há um parque ao lado da escola.',
          'O restaurante está ao lado do cinema.',
          'Ela colocou a mala ao lado da cadeira.'
        ]
      },
      {
        pt: 'Atrás de',
        zh: '在...後面',
        exs: [
          'O jardim fica atrás da casa.',
          'Esconde-te atrás da cortina.',
          'Há um parque de estacionamento atrás do edifício.',
          'Ela estava sentada atrás de mim na sala.',
          'O gato fugiu para trás do armário.'
        ]
      },
      {
        pt: 'À frente de',
        zh: '在...前面',
        exs: [
          'O carro dela está à frente do meu.',
          'A fila à frente do cinema era enorme.',
          'Ela sentou-se à frente da televisão.',
          'Há uma praça à frente da igreja.',
          'Ele marchava à frente do grupo.'
        ]
      },
      {
        pt: 'Perto de',
        zh: '靠近...、離...近',
        exs: [
          'Moro perto do centro da cidade.',
          'A escola fica perto da biblioteca.',
          'Não se sente perto da porta, que há corrente de ar.',
          'O hotel fica perto da estação de comboios.',
          'Ela mora perto do hospital.'
        ]
      },
      {
        pt: 'Longe de',
        zh: '遠離...、離...遠',
        exs: [
          'A praia fica longe da cidade.',
          'Ele mora longe do trabalho.',
          'Não quero estar longe da minha família.',
          'A aldeia fica longe de tudo.',
          'Longe de mim criticar o teu trabalho.'
        ]
      },
      {
        pt: 'Dentro de',
        zh: '在...裡面',
        exs: [
          'O presente está dentro da caixa.',
          'Não fumes dentro de casa.',
          'A carteira estava dentro da mochila.',
          'Dentro do armário, encontrei um casaco antigo.',
          'Dentro de momentos, o espetáculo começa.'
        ]
      },
      {
        pt: 'Fora de',
        zh: '在...外面',
        exs: [
          'Deixei os sapatos fora de casa.',
          'Ele está fora do país há um mês.',
          'Fora de horas, o edifício está fechado.',
          'O cão ficou fora de casa durante a noite.',
          'Ela mora fora da cidade.'
        ]
      },
      {
        pt: 'Por baixo de',
        zh: '在...下面',
        exs: [
          'O tapete está por baixo da mesa.',
          'Há um fio elétrico por baixo do chão.',
          'Ela passou por baixo da ponte.',
          'O gato escondeu-se por baixo do carro.',
          'O cano passa por baixo da parede.'
        ]
      },
      {
        pt: 'Por cima de',
        zh: '在...上面',
        exs: [
          'O avião voou por cima das nuvens.',
          'Passa o pano por cima da mesa.',
          'Ela saltou por cima do muro.',
          'O sol brilhava por cima das montanhas.',
          'Põe o casaco por cima do sofá.'
        ]
      },
      {
        pt: 'Ao fundo de',
        zh: '在...盡頭/底部',
        exs: [
          'A cozinha fica ao fundo do corredor.',
          'Há um jardim ao fundo do quintal.',
          'O bar está ao fundo da rua.',
          'Ela sentou-se ao fundo da sala.',
          'A garagem fica ao fundo do prédio.'
        ]
      },
      {
        pt: 'Em frente a',
        zh: '在...正對面',
        exs: [
          'A escola fica em frente ao parque.',
          'O café está em frente à estação.',
          'Estacionou o carro em frente ao hospital.',
          'Ela mora em frente à praia.',
          'A farmácia fica em frente ao correio.'
        ]
      },
      {
        pt: 'Junto a',
        zh: '靠近...、在...旁邊',
        exs: [
          'A loja fica junto à igreja.',
          'Estaciona o carro junto ao muro.',
          'A criança estava junto à mãe.',
          'Há uma árvore junto à janela.',
          'O banco fica junto ao supermercado.'
        ]
      },
      {
        pt: 'Ao pé de',
        zh: '在...旁邊、靠近...',
        exs: [
          'A minha casa fica ao pé da escola.',
          'Senta-te ao pé de mim.',
          'O cão está sempre ao pé do dono.',
          'O jardim fica ao pé da entrada.',
          'Há uma padaria ao pé do mercado.'
        ]
      },
      {
        pt: 'Deste lado',
        zh: '在這一邊',
        exs: [
          'Fica deste lado da rua.',
          'O parque é deste lado do rio.',
          'Deste lado, a vista é melhor.',
          'Ela mora deste lado da cidade.',
          'Deste lado do edifício há mais luz.'
        ]
      },
      {
        pt: 'Do outro lado',
        zh: '在另一邊',
        exs: [
          'A farmácia fica do outro lado da rua.',
          'Do outro lado do rio há uma aldeia.',
          'Ela sentou-se do outro lado da mesa.',
          'O jardim está do outro lado da casa.',
          'Do outro lado da fronteira, o clima é diferente.'
        ]
      },
      {
        pt: 'Em frente de',
        zh: '在...前面',
        exs: [
          'O carro parou em frente da entrada.',
          'Havia uma fila em frente do balcão.',
          'Ela estava em frente do espelho.',
          'O autocarro parou em frente da escola.',
          'Construíram um monumento em frente da câmara municipal.'
        ]
      },
      {
        pt: 'Frente a',
        zh: '面對...、正對著...',
        exs: [
          'Ficou frente a frente com o adversário.',
          'O hotel está frente ao mar.',
          'Ela sentou-se frente à televisão.',
          'O edifício fica frente à praça principal.',
          'Frente a tantas dificuldades, ele não desistiu.'
        ]
      },
      {
        pt: 'Detrás de',
        zh: '在...後面',
        exs: [
          'O gato estava detrás da cortina.',
          'Há um jardim detrás da casa.',
          'Ela escondeu-se detrás da porta.',
          'O sol pôs-se detrás das montanhas.',
          'O parque fica detrás da igreja.'
        ]
      },
      {
        pt: 'No meio de',
        zh: '在...中間',
        exs: [
          'No meio da praça há uma fonte.',
          'Ela sentou-se no meio da sala.',
          'Havia uma árvore no meio do caminho.',
          'No meio da multidão, perdi-a de vista.',
          'O lago fica no meio do parque.'
        ]
      },
      {
        pt: 'Cerca de',
        zh: '大約、將近',
        exs: [
          'Havia cerca de cinquenta pessoas na sala.',
          'O projeto custou cerca de cem mil euros.',
          'Ele chegou há cerca de uma hora.',
          'A viagem demora cerca de três horas.',
          'Ganho cerca de dois mil euros por mês.'
        ]
      },
      {
        pt: 'Próximo de',
        zh: '接近...',
        exs: [
          'Moro próximo do centro comercial.',
          'A data está próxima do fim do prazo.',
          'Ela estava próxima de atingir o objetivo.',
          'O hotel fica próximo da estação.',
          'O valor apresentado está próximo do orçamento previsto.'
        ]
      },
      {
        pt: 'Através de',
        zh: '通過...、穿過...',
        exs: [
          'Conheci-o através de um amigo comum.',
          'Através da janela, via-se o jardim.',
          'Recebemos a notícia através dos jornais.',
          'Através de muito esforço, conseguiu o emprego.',
          'O rio passa através da cidade.'
        ]
      },
      {
        pt: 'Por cento (%)',
        zh: '百分之...',
        exs: [
          'A taxa de inflação subiu dois por cento.',
          'Cerca de cinquenta por cento dos alunos passaram no exame.',
          'O desconto é de vinte por cento em todos os artigos.',
          'Apenas trinta por cento da população votou.',
          'O PIB cresceu um e meio por cento este trimestre.'
        ]
      },
      {
        pt: 'por cento',
        zh: '百分之... (%)',
        exs: [
          'Cem por cento dos funcionários receberam o bónus.',
          'A taxa de desemprego desceu para seis por cento.',
          'O lucro aumentou dez por cento em relação ao ano passado.',
          'Noventa por cento dos inquiridos concordaram com a medida.',
          'A probabilidade de sucesso é de setenta e cinco por cento.'
        ]
      },
      {
        pt: 'quanto a',
        zh: '關於；至於',
        exs: [
          'Quanto a mim, prefiro ficar em casa.',
          'Quanto ao que disseste, não tenho opinião formada.',
          'Quanto ao resto, logo se vê.',
          'Quanto a isso, não te preocupes.',
          'Quanto ao horário, teremos de o ajustar.'
        ]
      },
      {
        pt: 'beira-mar',
        zh: '海邊',
        exs: [
          'Passámos as férias numa casa à beira-mar.',
          'O restaurante fica mesmo à beira-mar.',
          'Ela adora passear à beira-mar ao pôr do sol.',
          'Compraram um apartamento à beira-mar no Algarve.',
          'A estrada acompanha a costa à beira-mar.'
        ]
      },
    ],
  },
  {
    categoria: 'Outros',
    desc: 'Outras expressões',
    items: [
      {
        pt: 'Às vezes',
        zh: '有時候',
        exs: [
          'Às vezes, gosto de ficar em casa a ler.',
          'Ela às vezes chega atrasada ao trabalho.',
          'Às vezes, é melhor não dizer nada.',
          'Às vezes, o silêncio vale mais do que mil palavras.',
          'Vou ao cinema às vezes, quando tenho tempo.'
        ]
      },
      {
        pt: 'Por isso',
        zh: '因此、所以',
        exs: [
          'Estava doente, por isso não fui trabalhar.',
          'Choveu muito, por isso a festa foi cancelada.',
          'Ela estudou muito, por isso passou no exame.',
          'O carro avariou, por isso chegámos atrasados.',
          'Não gosto de acordar cedo, por isso evito turnos da manhã.'
        ]
      },
      {
        pt: 'pelo menos',
        zh: '至少',
        exs: [
          'Pelo menos, tenta fazer o teu melhor.',
          'Devias ter-lhe dito pelo menos a verdade.',
          'Pelo menos ficámos com a consciência tranquila.',
          'O trabalho não é perfeito, mas pelo menos está feito.',
          'Se não ganharmos, que pelo menos nos divirtamos.'
        ]
      },
      {
        pt: 'aqui há gato',
        zh: '有貓膩',
        exs: [
          'Não confio nele, aqui há gato.',
          'O negócio é bom demais para ser verdade, aqui há gato.',
          'Ele desapareceu sem deixar rasto, aqui há gato.',
          'Aquela proposta parece suspeita, aqui há gato.',
          'Toda a gente concorda sem questionar, aqui há gato.'
        ]
      },
      {
        pt: 'um por um',
        zh: '一個一個地',
        exs: [
          'Verificámos os documentos um por um.',
          'Ela cumprimentou os convidados um por um.',
          'Tivemos de resolver os problemas um por um.',
          'Os alunos entraram na sala um por um.',
          'Vamos analisar os casos um por um.'
        ]
      },
      {
        pt: 'em relação a',
        zh: '關於；相比',
        exs: [
          'Em relação ao teu pedido, ainda estamos a analisar.',
          'A empresa melhorou em relação ao ano passado.',
          'Em relação ao orçamento, temos algumas propostas.',
          'Ele é mais experiente em relação aos outros candidatos.',
          'Em relação a isso, prefiro não comentar.'
        ]
      },
      {
        pt: 'não é verdade?',
        zh: '不是嗎？',
        exs: [
          'O filme era interessante, não é verdade?',
          'Tu vais à festa, não é verdade?',
          'Já não há mais bilhetes, não é verdade?',
          'Ela é a tua irmã, não é verdade?',
          'Fizemos um bom trabalho, não é verdade?'
        ]
      },
    ],
  },
  {
    categoria: 'Causa',
    desc: 'Causa, motivo ou justificação (originais)',
    items: [
      {
        pt: 'por causa de',
        zh: '因為',
        exs: [
          'Não fui à praia por causa do mau tempo.',
          'Ela faltou à aula por causa de uma consulta.',
          'O voo foi cancelado por causa da greve dos pilotos.',
          'Ele está chateado por causa do que disseste.',
          'O jogo foi adiado por causa da chuva intensa.'
        ]
      },
    ],
  },
  {
    categoria: 'Oposição',
    desc: 'Contraste entre ideias (originais)',
    items: [
      {
        pt: 'no entanto',
        zh: '然而',
        exs: [
          'O carro é caro; no entanto, a qualidade justifica o preço.',
          'Choveu muito; no entanto, fomos passear na mesma.',
          'Ele é novo; no entanto, demonstra muita maturidade.',
          'O projeto é ambicioso; no entanto, é exequível com os recursos disponíveis.',
          'Ela errou; no entanto, pediu desculpa e corrigiu o erro.'
        ]
      },
    ],
  },
];
