package com.management.service;

import com.management.dto.VantagemRequestDTO;
import com.management.exception.AcessoNegadoException;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.exception.RegraNegocioException;
import com.management.model.Empresa;
import com.management.model.Vantagem;
import com.management.repository.ResgateVantagemRepository;
import com.management.repository.VantagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
public class VantagemService {

    private static final long TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB
    private static final Set<String> TIPOS_FOTO = Set.of("image/png", "image/jpeg", "image/webp", "image/gif");

    private final VantagemRepository vantagemRepository;
    private final ResgateVantagemRepository resgateRepository;
    private final EmpresaService empresaService;

    public VantagemService(VantagemRepository vantagemRepository,
                           ResgateVantagemRepository resgateRepository,
                           EmpresaService empresaService) {
        this.vantagemRepository = vantagemRepository;
        this.resgateRepository = resgateRepository;
        this.empresaService = empresaService;
    }

    public List<Vantagem> listarCatalogo() {
        return vantagemRepository.findAllByOrderByNomeAsc();
    }

    public List<Vantagem> listarDaEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaIdOrderByNomeAsc(empresaId);
    }

    public Vantagem buscarPorId(Long id) {
        return vantagemRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vantagem não encontrada com ID: " + id));
    }

    @Transactional
    public Vantagem criar(Long empresaId, VantagemRequestDTO dto) {
        MultipartFile foto = dto.getFoto();
        if (foto == null || foto.isEmpty()) {
            throw new RegraNegocioException("A foto do produto é obrigatória.");
        }
        validarFoto(foto);

        Empresa empresa = empresaService.buscarPorId(empresaId);
        Vantagem vantagem = empresa.cadastrarVantagem(dto.getNome().trim(), dto.getDescricao().trim(),
                dto.getCusto(), lerBytes(foto), foto.getContentType(), dto.getQuantidade());
        return vantagemRepository.save(vantagem);
    }

    @Transactional
    public Vantagem atualizar(Long empresaId, Long vantagemId, VantagemRequestDTO dto) {
        Vantagem vantagem = buscarDaEmpresa(empresaId, vantagemId);
        vantagem.setNome(dto.getNome().trim());
        vantagem.setDescricao(dto.getDescricao().trim());
        vantagem.setCusto(dto.getCusto());
        vantagem.setQuantidade(dto.getQuantidade());

        MultipartFile foto = dto.getFoto();
        if (foto != null && !foto.isEmpty()) {
            validarFoto(foto);
            vantagem.atualizarFoto(lerBytes(foto), foto.getContentType());
        }
        return vantagemRepository.save(vantagem);
    }

    @Transactional
    public void excluir(Long empresaId, Long vantagemId) {
        Vantagem vantagem = buscarDaEmpresa(empresaId, vantagemId);
        if (resgateRepository.existsByVantagemId(vantagemId)) {
            throw new RegraNegocioException("Esta vantagem já foi resgatada e não pode ser excluída "
                    + "(os cupons emitidos precisam ser preservados). Zere o estoque para retirá-la do catálogo.");
        }
        vantagem.getEmpresa().getListaVantagem().remove(vantagem);
        vantagemRepository.delete(vantagem);
    }

    private Vantagem buscarDaEmpresa(Long empresaId, Long vantagemId) {
        Vantagem vantagem = buscarPorId(vantagemId);
        if (!vantagem.getEmpresa().getId().equals(empresaId)) {
            throw new AcessoNegadoException("Esta vantagem pertence a outra empresa parceira.");
        }
        return vantagem;
    }

    private void validarFoto(MultipartFile foto) {
        if (foto.getContentType() == null || !TIPOS_FOTO.contains(foto.getContentType())) {
            throw new RegraNegocioException("Formato de foto inválido. Use PNG, JPEG, WEBP ou GIF.");
        }
        if (foto.getSize() > TAMANHO_MAXIMO_FOTO) {
            throw new RegraNegocioException("A foto deve ter no máximo 2 MB.");
        }
    }

    private byte[] lerBytes(MultipartFile foto) {
        try {
            return foto.getBytes();
        } catch (IOException e) {
            throw new RegraNegocioException("Não foi possível ler a foto enviada.");
        }
    }
}
