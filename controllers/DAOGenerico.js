const { EntityManager, Persistence } = require('academix'); // Substitua 'some-persistence-library' pelo nome da biblioteca de persistência que você está usando

class DAOGenerico {
    constructor(clazz) {
        this.em = EntityManager.createEntityManagerFactory('UP').createEntityManager();
        this.clazz = clazz;
    }

    inserir(e) {
        this.em.getTransaction().begin();
        this.em.persist(e);
        this.em.getTransaction().commit();
    }

    atualizar(e) {
        this.em.getTransaction().begin();
        this.em.merge(e);
        this.em.getTransaction().commit();
    }

    remover(e) {
        this.em.getTransaction().begin();
        this.em.remove(e);
        this.em.getTransaction().commit();
    }

    obter(id) {
        const ent = this.em.find(this.clazz, id);
        if (ent === null) {
            return ent;
        } else {
            this.em.refresh(ent);
            return ent;
        }
    }

    list() {
        return this.em.createQuery(`SELECT e FROM ${this.clazz.getSimpleName()} e`).getResultList();
    }
}

module.exports = DAOGenerico;

