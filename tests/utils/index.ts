import { DataSource } from 'typeorm';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        console.log(repository);
        await repository.clear();
    }
};
