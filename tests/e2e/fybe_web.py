"""Testes de ponta a ponta do Fybe na versão web do app.

A API é simulada pelo próprio Playwright (nenhum dado real é usado).
Como rodar:
  1. EXPO_PUBLIC_API_URL=http://localhost:8080 npx expo export --platform web --output-dir dist
  2. python3 tests/e2e/serve.py dist 8099 &
  3. pip install playwright && python3 -m playwright install chromium
  4. python3 tests/e2e/fybe_web.py pasta-para-capturas
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('FYBE_BASE_URL', 'http://127.0.0.1:8099')
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)
results = []
console_errors = []

def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail else ''), flush=True)

NUTRI = {'id': 7, 'nome': 'Dra. Teste', 'crn': 'CRN-3 0000', 'especialidade': 'Clínica', 'status': 'approved', 'email': 'n@x'}

def patient(linked):
    return {'id': 1, 'nome': 'Paciente Teste', 'email': 'p@x', 'idade': 30, 'peso': 70, 'altura': 170, 'pesoMeta': 65,
            'objetivo': 'Perder peso', 'atividade': 'Moderada', 'condicaoSaude': '', 'metaAgua': 2.5,
            'nutricionistaId': 7 if linked else None, 'status': 'accepted' if linked else None}

def install_api(context, linked=False):
    def handle(route):
        url = route.request.url
        path = '/api/' + url.split('/api/', 1)[1].split('?')[0]
        body = []
        if path == '/api/auth/me': body = patient(linked)
        elif path == '/api/nutricionistas/7': body = NUTRI
        elif path == '/api/nutricionistas': body = [NUTRI]
        elif path.endswith('/avaliacoes'): body = {'media': None, 'total': 0, 'avaliacoes': []}
        elif path == '/api/diario/meta': body = {'calorias': 2000, 'origem': 'padrao', 'editavel': True, 'refeicoes': []}
        elif path == '/api/diario/medidas':
            body = [{'id': i, 'peso': str(70 - i * 0.5), 'cintura': '80', 'dataRegistro': f'2026-09-{10+i:02d}T10:00:00', 'createdAt': f'2026-09-{10+i:02d}T10:00:00'} for i in range(1, 6)]
        route.fulfill(status=200, content_type='application/json', body=json.dumps(body), headers={'Access-Control-Allow-Origin': '*'})
    context.route(re.compile(r'(http://localhost:8080|https://mockapi\.test)/.*'), handle)

def new_page(browser, width=390, height=844, linked=False, dark=False, fybe_prefs=None, reduced=False):
    ctx = browser.new_context(viewport={'width': width, 'height': height}, color_scheme='dark' if dark else 'light',
                              reduced_motion='reduce' if reduced else 'no-preference', has_touch=width < 768)
    install_api(ctx, linked)
    init = "localStorage.setItem('nutrifybe.accessToken','token-de-teste');"
    if fybe_prefs is not None:
        init += f"localStorage.setItem('nutrifybe:fybe:v1', {json.dumps(json.dumps(fybe_prefs))});"
    ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ {init} sessionStorage.setItem('seeded','1'); }}")
    page = ctx.new_page()
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: console_errors.append('pageerror: ' + str(e)))
    return ctx, page

def tid(page, id_):
    return page.locator(f'[data-testid="{id_}"]')

def box(loc):
    return loc.bounding_box()

def counter(page):
    return tid(page, 'fybe-step-counter').inner_text()

def stable(page, target):
    """Confere de novo depois de 500 ms: o destaque precisa continuar no lugar (rolagem terminada)."""
    page.wait_for_timeout(500)
    a, b = box(tid(page, 'fybe-highlight')), box(tid(page, f'fybe-target-{target}'))
    return bool(a and b and abs(a['y'] - (b['y'] - 6)) <= 3 or (a and b and a['y'] >= b['y'] - 6))

def wait_ring(page, target):
    """Espera o destaque coincidir com o elemento real (tolerância para o recuo do anel)."""
    t = tid(page, f'fybe-target-{target}')
    for _ in range(30):
        page.wait_for_timeout(200)
        r = tid(page, 'fybe-highlight')
        if r.count() and t.count():
            a, b = box(r), box(t)
            if a and b and stable(page, target) and abs(a['x'] - (b['x'] - 6)) <= 3 and abs(a['y'] - (b['y'] - 6)) <= 3 and abs(a['width'] - (b['width'] + 12)) <= 4:
                return True
            # elemento maior que a tela: o destaque é recortado na parte visível
            if a and b and abs(a['x'] - (b['x'] - 6)) <= 3 and a['height'] > 20 and a['y'] >= b['y'] - 7 and a['y'] + a['height'] <= b['y'] + b['height'] + 7:
                return True
    return False

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ── Primeiro acesso, celular 390 px ───────────────────────────────────────
    ctx, page = new_page(browser)
    page.goto(BASE + '/')
    page.wait_for_url(re.compile(r'.*8099/?$'), timeout=15000)
    intro = tid(page, 'fybe-intro')
    intro.wait_for(timeout=10000)
    check('4. Apresentação aparece no primeiro acesso à tela Início', intro.is_visible())
    page.screenshot(path=f'{OUT}/01-intro-390.png')
    img = intro.locator('img').first
    nat = page.evaluate("el => [el.naturalWidth, el.naturalHeight]", img.element_handle())
    shown = page.evaluate("el => [el.parentElement.offsetWidth, el.parentElement.offsetHeight]", img.element_handle())
    ratio_ok = abs(shown[0] / shown[1] - nat[0] / nat[1]) < 0.02
    check('2. Ilustração original do Fybe sem deformação (mesma proporção do arquivo)', ratio_ok, f'arquivo={nat}, exibido={shown}')
    check('Apresentação tem "Vamos lá!" e "Explorar sozinho"', page.get_by_text('Vamos lá!').is_visible() and page.get_by_text('Explorar sozinho').is_visible())

    # 5. Explorar sozinho
    page.get_by_text('Explorar sozinho').click()
    page.wait_for_timeout(500)
    check('5. "Explorar sozinho" fecha a apresentação sem iniciar tutorial', intro.count() == 0 and tid(page, 'fybe-tour').count() == 0)
    stored = page.evaluate("localStorage.getItem('nutrifybe:fybe:v1')")
    check('13. Preferência salva localmente (apresentação vista)', stored and json.loads(stored).get('introSeen') is True, stored)
    check('13. Armazenamento do Fybe sem dados pessoais', stored and set(json.loads(stored).keys()) == {'introSeen', 'completed'} and 'Paciente' not in stored)

    # 1. botão nas telas
    fab = tid(page, 'fybe-button')
    check('1. Botão do Fybe aparece no Início', fab.is_visible())
    fb = box(fab)
    tabbar_top = 844 - 68
    check('Botão acima da barra de abas e dentro da tela', fb['y'] + fb['height'] <= tabbar_top and fb['x'] + fb['width'] <= 390, str(fb))
    check('Botão tem nome acessível', (fab.get_attribute('aria-label') or '').startswith('Fybe'), fab.get_attribute('aria-label'))
    check('Área de toque do botão ≥ 44 px', fb['width'] >= 44 and fb['height'] >= 44)

    # reload: apresentação não volta
    page.reload()
    page.wait_for_timeout(2500)
    check('4. Apresentação não reaparece depois de vista', tid(page, 'fybe-intro').count() == 0)

    # 3. painel abre e fecha
    tid(page, 'fybe-button').click()
    panel = tid(page, 'fybe-panel')
    panel.wait_for(timeout=5000)
    check('3. Botão abre o painel', panel.is_visible())
    page.wait_for_timeout(700)  # fim da animação de entrada
    pb = box(panel)
    check('16. Painel cabe na tela de 390 px', pb['x'] >= 0 and pb['x'] + pb['width'] <= 390 and pb['y'] >= 0 and pb['y'] + pb['height'] <= 844, str(pb))
    check('12. Ajuda contextual do Início', panel.get_by_text('Esta é a sua tela principal', exact=False).is_visible())
    check('Painel informa que não é IA e não dá orientação nutricional', panel.get_by_text('Não sou uma inteligência artificial', exact=False).count() == 1)
    check('Painel com papel de diálogo', panel.get_attribute('role') == 'dialog' and panel.get_attribute('aria-modal') in ('true', ''), str(panel.get_attribute('role')))
    page.screenshot(path=f'{OUT}/02-painel-inicio-390.png')
    # FAQ abre
    panel.get_by_text('Onde vejo os dias anteriores?').click()
    check('FAQ expande a resposta', panel.get_by_text('No Histórico alimentar.').is_visible())
    tid(page, 'fybe-panel-close').click()
    page.wait_for_timeout(400)
    check('3. Botão fechar fecha o painel', tid(page, 'fybe-panel').count() == 0)
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    page.keyboard.press('Escape'); page.wait_for_timeout(400)
    check('18. Tecla Esc fecha o painel', tid(page, 'fybe-panel').count() == 0)

    # 6–10 tutorial de apresentação
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    tid(page, 'fybe-tutorial-apresentacao').click()
    tid(page, 'fybe-tour-card').wait_for(timeout=5000)
    check('6. Tutorial começa pela etapa 1', counter(page) == 'Etapa 1 de 6', counter(page))
    page.wait_for_timeout(600)
    focused = page.evaluate("document.activeElement && document.activeElement.getAttribute('data-testid')")
    check('18. Ao abrir o tutorial, o foco do teclado vai para o texto da etapa', focused == 'fybe-step-text', str(focused))
    page.keyboard.press('Tab')
    lbl = page.evaluate("document.activeElement && (document.activeElement.getAttribute('aria-label') || document.activeElement.innerText)")
    check('18. Tab leva aos controles do tutorial', lbl in ('Pular tutorial', 'Próxima etapa', 'Fechar tutorial'), str(lbl))
    check('10. Destaque coincide com o resumo do dia (home.summary)', wait_ring(page, 'home.summary'))
    check('Painel fecha ao iniciar tutorial e botão flutuante some', tid(page, 'fybe-panel').count() == 0 and tid(page, 'fybe-button').count() == 0)
    page.screenshot(path=f'{OUT}/03-tour-etapa1-390.png')
    page.get_by_label('Próxima etapa').click()
    check('7/9. Próximo avança e atualiza o progresso', counter(page) == 'Etapa 2 de 6', counter(page))
    check('10. Destaque no botão Registrar refeição', wait_ring(page, 'home.register'))
    page.get_by_label('Etapa anterior').click()
    check('7. Voltar retorna à etapa anterior', counter(page) == 'Etapa 1 de 6', counter(page))
    for target in ['home.register', 'home.followup', 'home.diary', 'home.shortcuts']:
        page.get_by_label('Próxima etapa').click()
        ok = wait_ring(page, target)
        check(f'10. Destaque acompanha a rolagem até {target}', ok)
        if target == 'home.shortcuts':
            page.screenshot(path=f'{OUT}/04-tour-atalhos-390.png')
            tb = box(tid(page, 'fybe-tour-card')); sb = box(tid(page, 'fybe-target-home.shortcuts'))
            overlap = not (tb['y'] >= sb['y'] + sb['height'] or tb['y'] + tb['height'] <= sb['y'])
            check('17. Cartão do tutorial não cobre o elemento destacado', not overlap, f'cartão={tb}, alvo={sb}')
    page.get_by_label('Próxima etapa').click()
    check('Etapa final sem alvo mostra só a mensagem', counter(page) == 'Etapa 6 de 6' and tid(page, 'fybe-highlight').count() == 0)
    check('18. Indicador de progresso acessível', tid(page, 'fybe-tour-card').locator('[role="progressbar"]').count() == 1)
    page.get_by_label('Concluir tutorial').click()
    tid(page, 'fybe-celebration').wait_for(timeout=3000)
    check('Conclusão mostra mensagem e encerra o tutorial', tid(page, 'fybe-tour').count() == 0)
    stored = json.loads(page.evaluate("localStorage.getItem('nutrifybe:fybe:v1')"))
    check('13. Tutorial concluído fica salvo', stored['completed'].get('apresentacao') is True, str(stored))

    # 14. reiniciar e 8. pular/fechar
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    check('Painel marca tutorial como concluído', 'Concluído' in (tid(page, 'fybe-tutorial-apresentacao').get_attribute('aria-label') or ''))
    tid(page, 'fybe-tutorial-apresentacao').click()
    tid(page, 'fybe-tour-card').wait_for()
    check('14. Tutorial pode ser iniciado novamente', counter(page) == 'Etapa 1 de 6')
    tid(page, 'fybe-skip').click(); page.wait_for_timeout(300)
    check('8. "Pular" encerra o tutorial', tid(page, 'fybe-tour').count() == 0 and tid(page, 'fybe-button').is_visible())
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-registrar-refeicao').click(); tid(page, 'fybe-tour-card').wait_for()
    tid(page, 'fybe-tour-close').click(); page.wait_for_timeout(300)
    check('8. Botão fechar (X) encerra o tutorial', tid(page, 'fybe-tour').count() == 0)
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-registrar-refeicao').click(); tid(page, 'fybe-tour-card').wait_for()
    page.keyboard.press('Escape'); page.wait_for_timeout(300)
    check('18. Esc encerra o tutorial', tid(page, 'fybe-tour').count() == 0)

    # O tutorial não bloqueia o app: o botão real continua funcionando
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-registrar-refeicao').click(); tid(page, 'fybe-tour-card').wait_for()
    wait_ring(page, 'home.register')
    page.get_by_role('button', name='Registrar refeição').first.click()
    page.wait_for_timeout(800)
    check('20. Com o tutorial aberto, o botão real "Registrar refeição" abre o formulário', page.get_by_text('Tipo de refeição', exact=False).count() > 0 or page.get_by_placeholder(re.compile('alimento', re.I)).count() > 0)
    page.screenshot(path=f'{OUT}/05-formulario-com-tour.png')
    page.keyboard.press('Escape'); page.wait_for_timeout(300)
    page.reload(); page.wait_for_timeout(2500)

    # 15. Navegação: tutorial de outra tela navega até ela; troca manual pausa
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-evolucao').click()
    page.wait_for_url(re.compile(r'.*/trends'), timeout=5000)
    tid(page, 'fybe-tour-card').wait_for()
    check('15. Tutorial de outra tela navega até ela', '/trends' in page.url and counter(page) == 'Etapa 1 de 3')
    check('10. Destaque no Resumo da meta', wait_ring(page, 'trends.summary'))
    page.get_by_label('Próxima etapa').click()
    check('10. Destaque no gráfico', wait_ring(page, 'trends.chart'))
    page.get_by_role('tab', name=re.compile('Perfil')).click() if page.get_by_role('tab', name=re.compile('Perfil')).count() else page.get_by_label(re.compile('^Perfil')).first.click()
    page.wait_for_url(re.compile(r'.*/profile'), timeout=5000)
    page.wait_for_timeout(500)
    check('15. Trocar de aba manualmente pausa o tutorial (sem destaque perdido)', tid(page, 'fybe-tour').count() == 0 and page.get_by_text('Tutorial pausado').count() > 0)
    check('Botão mostra que há tutorial pausado', 'pausado' in (tid(page, 'fybe-button').get_attribute('aria-label') or ''))
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    check('12. Ajuda contextual muda para o Perfil', tid(page, 'fybe-panel').get_by_text('Aqui estão os seus dados', exact=False).is_visible())
    page.screenshot(path=f'{OUT}/06-painel-perfil-pausado.png')
    page.get_by_role('button', name='Continuar').click()
    page.wait_for_url(re.compile(r'.*/trends'), timeout=5000)
    tid(page, 'fybe-tour-card').wait_for()
    check('15. Continuar retoma na mesma etapa e na tela certa', counter(page) == 'Etapa 2 de 3', counter(page))
    page.get_by_label('Próxima etapa').click()
    check('10. Destaque no histórico de medidas (fim da tela)', wait_ring(page, 'trends.measures'))
    page.get_by_label('Concluir tutorial').click(); page.wait_for_timeout(300)

    # Perfil tutorial
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-perfil').click()
    page.wait_for_url(re.compile(r'.*/profile'), timeout=5000); tid(page, 'fybe-tour-card').wait_for()
    for t in ['profile.nutrition', 'profile.status', 'profile.tools', 'profile.menu']:
        check(f'10. Perfil: destaque em {t}', wait_ring(page, t))
        if t != 'profile.menu': page.get_by_label('Próxima etapa').click()
    page.screenshot(path=f'{OUT}/07-tour-perfil-menu.png')
    tb = box(tid(page, 'fybe-tour-card')); mb = box(tid(page, 'fybe-target-profile.menu'))
    check('17. Menu do perfil (alto): cartão não cobre o menu', tb['y'] >= mb['y'] + mb['height'] - 2, f'cartão={tb}, alvo={mb}')
    page.get_by_label('Concluir tutorial').click(); page.wait_for_timeout(300)

    # Plano tutorial
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-plano').click()
    page.wait_for_url(re.compile(r'.*/plan'), timeout=5000); tid(page, 'fybe-tour-card').wait_for()
    for t in ['plan.status', 'plan.current', 'plan.measures']:
        check(f'10. Plano: destaque em {t}', wait_ring(page, t))
        if t != 'plan.measures': page.get_by_label('Próxima etapa').click()
    page.get_by_label('Concluir tutorial').click(); page.wait_for_timeout(300)

    # 11. elemento ausente: remove o alvo do DOM durante a etapa
    tid(page, 'fybe-button').click(); tid(page, 'fybe-tutorial-registrar-refeicao').click()
    page.wait_for_url(re.compile(r'.*8099/?$'), timeout=5000); tid(page, 'fybe-tour-card').wait_for()
    page.get_by_label('Próxima etapa').click()  # etapa 2 (sem alvo)
    page.evaluate("document.querySelector('[data-testid=\"fybe-target-home.diary\"]').style.display='none'")
    page.get_by_label('Próxima etapa').click()  # etapa 3: alvo escondido
    tid(page, 'fybe-fallback').wait_for(timeout=4000)
    check('11. Elemento ausente mostra mensagem alternativa sem travar', tid(page, 'fybe-fallback').is_visible() and page.get_by_label('Próxima etapa').is_enabled())
    page.screenshot(path=f'{OUT}/08-alvo-ausente.png')
    page.get_by_label('Próxima etapa').click()
    check('11. Segue para a próxima etapa depois do alvo ausente', counter(page) == 'Etapa 4 de 4')
    page.get_by_label('Concluir tutorial').click()
    ctx.close()

    # 12. Tela sem ajuda própria? (todas as telas do Fybe têm) — verifica Água e IMC
    ctx, page = new_page(browser, fybe_prefs={'introSeen': True, 'completed': {}})
    page.goto(BASE + '/'); tid(page, 'fybe-button').wait_for(timeout=15000)
    page.get_by_label('Água', exact=True).first.click()
    page.wait_for_url(re.compile(r'.*/water'), timeout=5000)
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    check('12. Ajuda contextual na tela Água', tid(page, 'fybe-panel').get_by_text('Registre a água', exact=False).is_visible())
    check('Apresentação não aparece quando já vista', tid(page, 'fybe-intro').count() == 0)
    tid(page, 'fybe-panel-close').click()
    ctx.close()

    # Chat com acompanhamento ativo: botão vai para o cabeçalho
    ctx, page = new_page(browser, linked=True, fybe_prefs={'introSeen': True, 'completed': {}})
    page.goto(BASE + '/'); tid(page, 'fybe-button').wait_for(timeout=15000)
    page.get_by_label('Conversa com o nutricionista').first.click()
    page.wait_for_url(re.compile(r'.*/messages'), timeout=5000); page.wait_for_timeout(1000)
    check('17. No chat, o botão flutuante sai para não cobrir o campo de mensagem', tid(page, 'fybe-button').count() == 0 and tid(page, 'fybe-inline-button').is_visible())
    tid(page, 'fybe-inline-button').click(); tid(page, 'fybe-panel').wait_for()
    check('12. Ajuda contextual do Chat', tid(page, 'fybe-panel').get_by_text('conversa privada com o seu nutricionista', exact=False).count() > 0)
    page.wait_for_timeout(700); page.screenshot(path=f'{OUT}/09-chat-painel.png')
    page.keyboard.press('Escape'); page.wait_for_timeout(300)
    page.get_by_label(re.compile('^Início')).first.click(); page.wait_for_timeout(800)
    check('Botão flutuante volta ao sair do chat', tid(page, 'fybe-button').is_visible())
    ctx.close()

    # 16. Celular pequeno 320 px, tema escuro, movimento reduzido
    ctx, page = new_page(browser, width=320, height=568, dark=True, reduced=True)
    page.goto(BASE + '/'); tid(page, 'fybe-intro').wait_for(timeout=15000)
    ib = box(tid(page, 'fybe-intro'))
    check('16. Apresentação cabe em 320 x 568', ib['x'] >= 0 and ib['x'] + ib['width'] <= 320 and ib['y'] >= 0 and ib['y'] + ib['height'] <= 568, str(ib))
    page.screenshot(path=f'{OUT}/10-intro-320-escuro.png')
    page.get_by_text('Vamos lá!').click()
    tid(page, 'fybe-tour-card').wait_for()
    check('"Vamos lá!" inicia o tour de apresentação', counter(page) == 'Etapa 1 de 6')
    for _ in range(3): page.get_by_label('Próxima etapa').click(); page.wait_for_timeout(150)
    check('10. 320 px: destaque no diário (maior que a tela, recortado)', wait_ring(page, 'home.diary'))
    page.get_by_label('Próxima etapa').click()
    check('10. 320 px: destaque nos atalhos', wait_ring(page, 'home.shortcuts'))
    tb = box(tid(page, 'fybe-tour-card')); sb = box(tid(page, 'fybe-target-home.shortcuts'))
    check('17. 320 px: cartão não cobre o elemento destacado', tb['y'] >= sb['y'] + sb['height'] or tb['y'] + tb['height'] <= sb['y'], f'cartão={tb}, alvo={sb}')
    cb = box(tid(page, 'fybe-tour-card'))
    check('16. Cartão do tutorial cabe em 320 px', cb['x'] >= 0 and cb['x'] + cb['width'] <= 320 and cb['y'] >= 0 and cb['y'] + cb['height'] <= 568, str(cb))
    page.screenshot(path=f'{OUT}/11-tour-320-escuro.png')
    tid(page, 'fybe-skip').click()
    tid(page, 'fybe-button').click(); tid(page, 'fybe-panel').wait_for()
    pb = box(tid(page, 'fybe-panel'))
    check('16. Painel em 320 x 568 cabe na tela', pb['y'] >= 0 and pb['y'] + pb['height'] <= 568 and pb['width'] <= 320, str(pb))
    scrollable = page.evaluate("""() => { const p = document.querySelector('[data-testid="fybe-panel"]'); return [...p.querySelectorAll('div')].some(d => d.scrollHeight > d.clientHeight + 5 && getComputedStyle(d).overflowY !== 'visible'); }""")
    check('16. Painel com conteúdo longo rola internamente', scrollable)
    page.screenshot(path=f'{OUT}/12-painel-320-escuro.png')
    ctx.close()

    # Desktop 1280 x 800
    ctx, page = new_page(browser, width=1280, height=800, fybe_prefs={'introSeen': True, 'completed': {}})
    page.goto(BASE + '/'); tid(page, 'fybe-button').wait_for(timeout=15000)
    tid(page, 'fybe-button').focus(); page.keyboard.press('Enter')
    tid(page, 'fybe-panel').wait_for()
    pb = box(tid(page, 'fybe-panel'))
    check('Desktop: painel abre pelo teclado (Enter) como janela flutuante à direita', pb['width'] <= 420 and pb['x'] > 700, str(pb))
    page.screenshot(path=f'{OUT}/13-desktop-painel.png')
    tid(page, 'fybe-tutorial-apresentacao').click(); tid(page, 'fybe-tour-card').wait_for()
    check('Desktop: destaque no resumo', wait_ring(page, 'home.summary'))
    page.get_by_label('Próxima etapa').click(); wait_ring(page, 'home.register')
    page.screenshot(path=f'{OUT}/14-desktop-tour.png')
    # orientação/tamanho: redimensiona e o destaque acompanha
    page.set_viewport_size({'width': 844, 'height': 390})
    check('Mudança de tamanho/orientação: destaque reposicionado', wait_ring(page, 'home.register'))
    page.screenshot(path=f'{OUT}/15-paisagem.png')
    ctx.close()

    # Logout: Fybe não aparece fora da área logada
    ctx, page = new_page(browser, fybe_prefs={'introSeen': True, 'completed': {}})
    seen_on_launch = []
    page.goto(BASE + '/')
    for _ in range(8):
        page.wait_for_timeout(100)
        if page.get_by_text('Seu bem-estar começa aqui').count(): seen_on_launch.append(tid(page, 'fybe-button').count())
    check('1. Fybe não aparece na tela de abertura', seen_on_launch and not any(seen_on_launch), str(seen_on_launch))
    ctx.close()
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}); install_api(ctx)
    page = ctx.new_page(); page.goto(BASE + '/auth/welcome'); page.wait_for_timeout(2500)
    check('1. Fybe não aparece para quem não entrou (boas-vindas)', '/auth/welcome' in page.url and tid(page, 'fybe-button').count() == 0 and tid(page, 'fybe-intro').count() == 0, page.url)
    ctx.close()
    browser.close()

relevant = [e for e in console_errors if 'mockapi' not in e and 'Failed to load resource' not in e]
check('19. Sem erros relevantes no console', not relevant, '; '.join(relevant[:5]))
passed = sum(1 for r in results if r[1])
print(f'\n{passed}/{len(results)} verificações aprovadas')
json.dump([{'nome': n, 'ok': o, 'detalhe': d} for n, o, d in results], open(f'{OUT}/resultados.json', 'w'), ensure_ascii=False, indent=1)
