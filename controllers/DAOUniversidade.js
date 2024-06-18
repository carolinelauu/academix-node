const DAOGenerico = require('./DAOGenerico'); // Importe a classe DAOGenerico correspondente

class DAOUniversidade extends DAOGenerico {
    constructor() {
        super(Universidade);
        this.lista = [];
    }

    autoIdUniversidade() {
        const a = em.createQuery("SELECT MAX(e.cpf) FROM Universidade e ").getSingleResult();
        if (a !== null) {
            return a + 1;
        } else {
            return 1;
        }
    }

    listByNome(nome) {
        return em.createQuery("SELECT e FROM Universidade e WHERE e.nome_universidade LIKE :nome").setParameter("nome", "%" + nome + "%").getResultList();
    }

    listById(id) {
        return em.createQuery("SELECT e FROM Universidade e WHERE e.id_universidade = :id").setParameter("id", id).getResultList();
    }

    listInOrderNome() {
        return em.createQuery("SELECT e FROM Universidade e ORDER BY e.nome_universidade").getResultList();
    }

    listInOrderId() {
        return em.createQuery("SELECT e FROM Universidade e ORDER BY e.id_universidade").getResultList();
    }

    listInOrderNomeStrings(qualOrdem) {
        let lf;
        if (qualOrdem === "id") {
            lf = this.listInOrderId();
        } else {
            lf = this.listInOrderNome();
        }

        const ls = [];
        for (let i = 0; i < lf.length; i++) {
            ls.push(lf[i].id_universidade + "-" + lf[i].nome_universidade);
        }
        return ls;
    }

    static main() {
        const daoUniversidade = new DAOUniversidade();
        const listaUniversidade = daoUniversidade.list();
        for (const universidade of listaUniversidade) {
            console.log(universidade.id_universidade + "-" + universidade.nome_universidade);
        }
    }
}

module.exports = DAOUniversidade;