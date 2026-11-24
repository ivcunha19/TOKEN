package com.management.service.extrato;

import com.management.auth.UsuarioLogado;
import com.management.dto.ExtratoDTO;
import com.management.model.ETipoUsuario;

public interface ExtratoGerador {
    boolean suporta(ETipoUsuario tipo);

    ExtratoDTO gerar(UsuarioLogado usuario);
}
