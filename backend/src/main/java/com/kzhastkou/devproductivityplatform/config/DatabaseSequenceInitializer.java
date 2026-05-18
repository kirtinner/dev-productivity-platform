package com.kzhastkou.devproductivityplatform.config;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSequenceInitializer {

    private final EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void synchronizeIdentitySequences() {
        allowEmptyCurrentOrganization();
        synchronizeSequence("organizations_id_seq", "organizations");
        synchronizeSequence("clients_id_seq", "clients");
        synchronizeSequence("projects_id_seq", "projects");
        synchronizeSequence("tasks_id_seq", "tasks");
        synchronizeSequence("software_products_id_seq", "software_products");
        synchronizeSequence("user_settings_id_seq", "user_settings");
    }

    private void allowEmptyCurrentOrganization() {
        entityManager.createNativeQuery("""
                ALTER TABLE IF EXISTS user_settings
                ALTER COLUMN current_organization_id DROP NOT NULL
                """).executeUpdate();
    }

    private void synchronizeSequence(String sequenceName, String tableName) {
        entityManager.createNativeQuery("""
                SELECT setval(
                    '%s',
                    COALESCE((SELECT MAX(id) FROM %s), 1)
                )
                """.formatted(sequenceName, tableName)).getSingleResult();
    }
}
