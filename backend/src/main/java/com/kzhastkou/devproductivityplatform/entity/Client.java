package com.kzhastkou.devproductivityplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "clients",
        uniqueConstraints = @UniqueConstraint(columnNames = {"developer_id", "short_name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String shortName;

    @Column(nullable = false)
    private String fullName;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean notDisplayed = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id", nullable = false)
    private Developer developer;
}
