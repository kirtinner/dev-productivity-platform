package com.kzhastkou.devproductivityplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DevProductivityPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevProductivityPlatformApplication.class, args);
    }

}
