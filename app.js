// Configurações
const config = {
    chars: {
      alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      noAmbiguous: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz123456789'
    },
    security: {
      low: { complexity: 2 },
      medium: { complexity: 3 },
      high: { complexity: 4 }
    }
  };
  
  // Funções Principais
  function generateKeys() {
    try {
      const quantity = parseInt(document.getElementById('qtdRange').value);
      const format = getFormat();
      const settings = getSettings();
      
      const keys = [];
      const generated = new Set();
      
      for(let i = 0; i < quantity; i++) {
        let key;
        do {
          key = generateKey(format, settings);
          if(settings.checksum) key = addChecksum(key);
        } while(settings.unique && generated.has(key))
        
        generated.add(key);
        keys.push(key);
      }
      
      displayKeys(keys);
      updateJSON(keys);
      
    } catch (error) {
      alert(`Erro na geração: ${error.message}`);
      console.error(error);
    }
  }
  
  function generateKey(format, settings) {
    let key = '';
    const chars = getCharSet(settings);
    
    for(const c of format) {
      if(c === 'X') {
        let char = chars[Math.floor(Math.random() * chars.length)];
        
        if(settings.mixedCase && /[a-z]/i.test(char)) {
          char = Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
        }
        
        key += char;
      } else {
        key += c;
      }
    }
    
    return applySecurity(key, settings.securityLevel, chars);
  }
  
  function applySecurity(key, level, chars) {
    const sec = config.security[level];
    const keyArray = key.split('');
    let replacements = 0;
  
    while(replacements < sec.complexity) {
      const pos = Math.floor(Math.random() * key.length);
      if(keyArray[pos] !== '-') {
        keyArray[pos] = chars[Math.floor(Math.random() * chars.length)];
        replacements++;
      }
    }
    
    return keyArray.join('');
  }
  
  function getCharSet(settings) {
    let chars = config.chars.alphanum;
    
    if(settings.noAmbiguous) chars = config.chars.noAmbiguous;
    
    if(!settings.alphanum) {
      chars = settings.upper ? config.chars.alpha : config.chars.alpha.toLowerCase();
    }
    
    if(settings.mixedCase && settings.alphanum) {
      chars = config.chars.alphanum;
    } else if(settings.mixedCase && !settings.alphanum) {
      chars = config.chars.alpha;
    }
    
    if(!settings.alphanum) chars = chars.replace(/[0-9]/g, '');
    
    return chars;
  }
  
  function addChecksum(key) {
    const cleanKey = key.replace(/-/g, '');
    const sum = cleanKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return key + (sum % 36).toString(36).toUpperCase();
  }
  
  // Funções de UI
  function updatePreview() {
    try {
      const format = getFormat();
      document.getElementById('keyPreview').textContent = format.replace(/X/g, 'X');
    } catch (error) {
      console.error('Erro na pré-visualização:', error);
    }
  }
  
  function getFormat() {
    const formatType = document.getElementById('formatSelect').value;
    if(formatType === 'custom') {
      const custom = document.getElementById('customFormatInput').value;
      if(!custom) throw new Error('Formato personalizado vazio');
      return custom;
    }
    return formatType;
  }
  
  function getSettings() {
    return {
      hyphens: document.getElementById('hyphenCheck').checked,
      upper: document.getElementById('upperCheck').checked,
      mixedCase: document.getElementById('mixedCaseCheck').checked,
      alphanum: !document.getElementById('noAmbiguousCheck').checked,
      noAmbiguous: document.getElementById('noAmbiguousCheck').checked,
      unique: document.getElementById('uniqueCheck').checked,
      checksum: document.getElementById('checksumCheck').checked,
      securityLevel: document.getElementById('securityLevel').value
    };
  }
  
  function displayKeys(keys) {
    const container = document.getElementById('keysList');
    container.innerHTML = '';
    
    keys.forEach(key => {
      const div = document.createElement('div');
      div.style.background = 'var(--dark)';
      div.style.padding = '15px';
      div.style.borderRadius = '8px';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.innerHTML = `
        <span style="color:var(--primary);font-family:monospace">${key}</span>
        <button onclick="copyKey('${key}')" style="background:var(--secondary);color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer">
          <i class="fas fa-copy"></i>
        </button>
      `;
      container.appendChild(div);
    });
  }
  
  // Funções JSON
  function updateJSON(keys) {
    try {
      const jsonData = {
        meta: {
          generatedAt: new Date().toISOString(),
          totalKeys: keys.length,
          format: getFormat(),
          securityLevel: document.getElementById('securityLevel').value,
          checksum: document.getElementById('checksumCheck').checked,
          uniqueKeys: document.getElementById('uniqueCheck').checked
        },
        keys: keys
      };
      
      const jsonString = JSON.stringify(jsonData, null, 2);
      document.getElementById('jsonOutput').textContent = jsonString;
      return jsonString;
      
    } catch (error) {
      console.error('Erro ao gerar JSON:', error);
      alert('Erro ao formatar o JSON');
      return null;
    }
  }
  
  async function copyJSON() {
    try {
      const jsonContent = document.getElementById('jsonOutput').textContent;
      
      if (!jsonContent || jsonContent.trim() === '') {
        throw new Error('Nenhum conteúdo para copiar');
      }
      
      await navigator.clipboard.writeText(jsonContent);
      
      const notification = document.createElement('div');
      notification.textContent = '✓ JSON copiado com sucesso!';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.background = 'var(--darker)';
      notification.style.color = 'white';
      notification.style.padding = '12px';
      notification.style.borderRadius = '8px';
      notification.style.zIndex = '1000';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
      
    } catch (error) {
      alert(`Erro ao copiar: ${error.message}`);
      console.error(error);
    }
  }
  
  function downloadJSON() {
    try {
      const jsonContent = document.getElementById('jsonOutput').textContent;
      
      if (!jsonContent || jsonContent.trim() === '') {
        throw new Error('Nenhum conteúdo para exportar');
      }
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steam_keys_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      alert(`Erro ao exportar: ${error.message}`);
      console.error(error);
    }
  }
  
  // Event Listeners
  document.getElementById('formatSelect').addEventListener('change', function() {
    document.getElementById('customFormat').style.display = this.value === 'custom' ? 'block' : 'none';
    document.getElementById('hyphenCheck').disabled = this.value !== 'custom';
    updatePreview();
  });
  
  document.getElementById('customFormatInput').addEventListener('input', updatePreview);
  document.querySelectorAll('input[type="checkbox"], select').forEach(element => {
    element.addEventListener('change', updatePreview);
  });
  
  function toggleAdvanced() {
    const section = document.getElementById('advancedSection');
    const btn = document.getElementById('advancedBtn');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
    btn.innerHTML = section.style.display === 'none' 
      ? '<i class="fas fa-cogs"></i> Modo Avançado' 
      : '<i class="fas fa-cogs"></i> Modo Básico';
  }
  
  async function copyKey(key) {
    try {
      await navigator.clipboard.writeText(key);
      const notification = document.createElement('div');
      notification.textContent = '✓ Chave copiada!';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.background = 'var(--darker)';
      notification.style.color = 'white';
      notification.style.padding = '12px';
      notification.style.borderRadius = '8px';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 1500);
    } catch (error) {
      alert('Erro ao copiar chave');
      console.error(error);
    }
  }
  
  // Inicialização
  updatePreview();