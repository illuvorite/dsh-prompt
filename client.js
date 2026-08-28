window.__ModuleLoader__.load({ id: "dsh-prompt", factory: (require) => {
  var module = { exports: {} };
  var exports = module.exports;
  var React = require('react');
  var useState = React.useState;
  var useEffect = React.useEffect;

  function Panel({ session, input, inputActions, enhance }) {
    var openState = useState(false);
    var open = openState[0], setOpen = openState[1];
    var choiceState = useState('original');
    var choice = choiceState[0], setChoice = choiceState[1];
    var enhancedState = useState(null);
    var enhanced = enhancedState[0], setEnhanced = enhancedState[1];
    var enhancedForState = useState('');
    var enhancedFor = enhancedForState[0], setEnhancedFor = enhancedForState[1];
    var loadingState = useState(false);
    var loading = loadingState[0], setLoading = loadingState[1];
    var errorState = useState(null);
    var error = errorState[0], setError = errorState[1];
    var original = input.draft;

    // `input.draft` is read on every render, so the "original" preview and
    // apply-to-input action always reflect the live composer text rather
    // than the value captured when the panel first opened.
    // If the draft changed since the last enhancement, the cached
    // `enhanced` text no longer matches the user's input — drop it so
    // "apply" can't push stale output back into the composer, and force
    // a fresh generation on the next click.
    useEffect(function() {
      if (enhanced !== null && enhancedFor !== original) {
        setEnhanced(null);
        setEnhancedFor('');
        setChoice(function(prev) { return prev === 'enhanced' ? 'original' : prev; });
      }
    }, [original, enhanced, enhancedFor]);

    var generate = async function() {
      if (loading || !original.trim()) return;
      setLoading(true);
      setError(null);
      try {
        var result = await enhance(original);
        if (!result.ok) throw new Error(result.error.message);
        var execution = result.value;
        if (execution === undefined || execution.result.kind !== 'success' || !execution.result.text) {
          throw new Error(execution && execution.result && execution.result.text ? execution.result.text : '模型没有返回增强后的提示词。');
        }
        setEnhanced(execution.result.text);
        setEnhancedFor(original);
        setChoice('enhanced');
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        setLoading(false);
      }
    };

    var selected = choice === 'original' ? original : (enhanced || '');
    return React.createElement('span', { style: { display: 'inline-flex', position: 'relative' } },
      React.createElement('button', { type: 'button', onClick: function() { var next = !open; setOpen(next); if (next && original.trim() && !enhanced) void generate(); } }, '✨ 增强提示词'),
      open && React.createElement('div', { style: { position: 'absolute', zIndex: 20, bottom: 'calc(100% + 8px)', right: 0, width: 'min(460px, 74vw)', padding: 12, border: '1px solid var(--dsh-border,#7f7f7f47)', borderRadius: 10, background: 'var(--dsh-panel,var(--dsh-surface,#202124))', boxShadow: '0 10px 30px #00000038' } },
        React.createElement('p', null, loading ? '模型增强中，请稍候…' : (original.trim() ? '选择版本后应用到输入框：' : '请先在输入框中输入提示词。')),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
          React.createElement('button', { type: 'button', onClick: function() { setChoice('original'); } }, '原始版本'),
          React.createElement('button', { type: 'button', onClick: function() { setChoice('enhanced'); } }, '增强版本')),
        error && React.createElement('p', { style: { color: '#e88' } }, error),
        React.createElement('div', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto', padding: 9, background: '#7f7f7f1a', borderRadius: 7 } }, selected || '（暂无内容）'),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 7, marginTop: 10 } },
          React.createElement('button', { type: 'button', disabled: loading || !original.trim(), onClick: function() { void generate(); } }, '重新生成'),
          React.createElement('button', { type: 'button', onClick: function() { setOpen(false); } }, '关闭'),
          React.createElement('button', { type: 'button', disabled: !selected, onClick: function() { inputActions.setDraft(selected); setOpen(false); } }, '应用到输入框'))
      ))
  }

  exports.name = 'dsh-prompt-client';
  exports.inject = ['remote', 'remote.commands', 'slots'];

  exports.apply = function(ctx) {
    ctx.slots.inject('conversation.input.right', function() {
      return ctx.slots.register({
        name: 'conversation.input.right',
        id: 'dsh-prompt',
        order: 20,
        label: '提示词增强',
        inject: function(sessionId) {
          return {
            enhance: function(text) { return ctx.remote.commands.execute(sessionId, '/dsh-enhance ' + text, []); }
          };
        },
      }, Panel);
    });
  };

  return module.exports;
}});
