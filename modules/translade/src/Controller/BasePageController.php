<?php

namespace Drupal\translade\Controller;
use Drupal\Core\Controller\ControllerBase;

class BasePageController extends ControllerBase {
    public function render() {
        return [
            '#title' => $this->t('Base Info Page'),
            '#theme' => 'translate_base_page',
        ];
    }
}