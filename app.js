// URL do backend — atualize com o IP da VM AWS quando fizer o deploy
const API_URL = 'http://54.226.110.69:3000';

const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');

// Buscar todos os produtos
async function fetchProducts() {
  const container = document.querySelector('#products-container');
  container.innerHTML = '<p class="loading">Carregando...</p>';

  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    if (!products || products.length === 0) {
      container.innerHTML = '<p class="empty">Nenhum produto cadastrado.</p>';
      return;
    }

    container.innerHTML = '';
    products.forEach(product => {
      container.appendChild(createProductCard(product));
    });
  } catch (err) {
    container.innerHTML = `<p class="error">Erro ao conectar com o servidor: ${err.message}</p>`;
  }
}

// Criar card de produto
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-info">
      <span class="product-id">ID: ${product.id}</span>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description || '<em>Sem descrição</em>'}</p>
      <span class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</span>
    </div>
    <div class="product-actions">
      <button class="btn btn-warning btn-sm"
        onclick="fillUpdateForm(${product.id}, \`${escStr(product.name)}\`, \`${escStr(product.description || '')}\`, ${product.price})">
        &#9998; Editar
      </button>
      <button class="btn btn-danger btn-sm"
        onclick="confirmDelete(${product.id}, \`${escStr(product.name)}\`)">
        &#128465; Excluir
      </button>
    </div>
  `;
  return card;
}

function escStr(str) {
  return String(str).replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// Preencher formulário de update com dados do produto
function fillUpdateForm(id, name, description, price) {
  document.querySelector('#update-id').value = id;
  document.querySelector('#update-name').value = name;
  document.querySelector('#update-description').value = description;
  document.querySelector('#update-price').value = price;
  document.querySelector('.update-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Buscar produto por ID
async function searchById() {
  const id = document.querySelector('#search-id').value;
  const resultDiv = document.querySelector('#search-result');

  if (!id || id < 1) {
    resultDiv.innerHTML = '<p class="error">Digite um ID válido.</p>';
    return;
  }

  resultDiv.innerHTML = '<p class="loading">Buscando...</p>';

  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      resultDiv.innerHTML = '<p class="empty">Produto não encontrado.</p>';
      return;
    }

    const product = Array.isArray(data) ? data[0] : data;
    resultDiv.innerHTML = `
      <div class="product-card search-found">
        <div class="product-info">
          <span class="product-id">ID: ${product.id}</span>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description || '<em>Sem descrição</em>'}</p>
          <span class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</span>
        </div>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p class="error">Erro ao buscar produto: ${err.message}</p>`;
  }
}

// Adicionar produto
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value;
  const description = addProductForm.elements['description'].value;
  const price = addProductForm.elements['price'].value;

  try {
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    });
    addProductForm.reset();
    await fetchProducts();
  } catch (err) {
    alert(`Erro ao adicionar produto: ${err.message}`);
  }
});

// Atualizar produto
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.querySelector('#update-id').value;
  const name = document.querySelector('#update-name').value;
  const description = document.querySelector('#update-description').value;
  const price = document.querySelector('#update-price').value;

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    });
    updateProductForm.reset();
    await fetchProducts();
    alert('Produto atualizado com sucesso!');
  } catch (err) {
    alert(`Erro ao atualizar produto: ${err.message}`);
  }
});

// Deletar produto com confirmação
async function confirmDelete(id, name) {
  if (!confirm(`Deseja excluir o produto "${name}"?`)) return;

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    await fetchProducts();
  } catch (err) {
    alert(`Erro ao excluir produto: ${err.message}`);
  }
}
